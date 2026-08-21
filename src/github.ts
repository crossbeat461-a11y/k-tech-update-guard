import { requestUrl } from "obsidian";
import { GITHUB_API, USER_AGENT } from "./constants";
import type { ReleaseAsset } from "./types";

export interface GitHubRelease {
  tagName: string;
  name: string;
  prerelease: boolean;
  publishedAt: string;
  notes: string;
  assets: ReleaseAsset[];
}

function authHeaders(token: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": USER_AGENT,
  };
  const trimmed = token.trim();
  if (trimmed) {
    headers.Authorization = `Bearer ${trimmed}`;
  }
  return headers;
}

export class RateLimitError extends Error {
  constructor() {
    super("GitHub API rate limit exceeded");
    this.name = "RateLimitError";
  }
}

export async function fetchJson<T>(
  url: string,
  token = ""
): Promise<{ status: number; json: T | null; text: string }> {
  const res = await requestUrl({
    url,
    method: "GET",
    headers: authHeaders(token),
    throw: false,
  });
  const remaining = res.headers["x-ratelimit-remaining"];
  if (res.status === 403 && remaining === "0") {
    throw new RateLimitError();
  }
  let json: T | null = null;
  const text = res.text || "";
  if (text) {
    try {
      json = JSON.parse(text) as T;
    } catch {
      json = null;
    }
  }
  return { status: res.status, json, text };
}

function downloadHeaders(token: string): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
  };
  const trimmed = token.trim();
  if (trimmed) {
    headers.Authorization = `Bearer ${trimmed}`;
  }
  return headers;
}

export function githubLatestFileUrl(repo: string, fileName: string): string {
  return `https://github.com/${repo}/releases/latest/download/${fileName}`;
}

export function defaultReleaseAssets(repo: string): ReleaseAsset[] {
  return [
    { name: "main.js", downloadUrl: githubLatestFileUrl(repo, "main.js") },
    { name: "manifest.json", downloadUrl: githubLatestFileUrl(repo, "manifest.json") },
    { name: "styles.css", downloadUrl: githubLatestFileUrl(repo, "styles.css") },
  ];
}

export async function fetchText(url: string, token = ""): Promise<string | null> {
  const res = await requestUrl({
    url,
    method: "GET",
    headers: downloadHeaders(token),
    throw: false,
  });
  if (res.status === 403) {
    const remaining = res.headers["x-ratelimit-remaining"];
    if (remaining === "0") throw new RateLimitError();
  }
  if (res.status < 200 || res.status >= 300) return null;
  if (res.text) return res.text;
  const buf = res.arrayBuffer;
  if (buf && buf.byteLength) {
    return new TextDecoder("utf-8").decode(buf);
  }
  return null;
}

export async function fetchLatestManifest(
  repo: string,
  token = ""
): Promise<{ version: string } | null> {
  const text = await fetchText(githubLatestFileUrl(repo, "manifest.json"), token);
  if (!text || /^\s*</.test(text)) return null;
  try {
    const json = JSON.parse(text) as { version?: string };
    const version = String(json.version || "").trim();
    return version ? { version } : null;
  } catch {
    return null;
  }
}

interface GitHubReleaseJson {
  tag_name?: string;
  name?: string | null;
  prerelease?: boolean;
  published_at?: string;
  body?: string | null;
  assets?: Array<{
    name?: string;
    browser_download_url?: string;
  }>;
}

export async function fetchLatestRelease(
  repo: string,
  token = ""
): Promise<GitHubRelease | null> {
  const { status, json } = await fetchJson<GitHubReleaseJson>(
    `${GITHUB_API}/repos/${repo}/releases/latest`,
    token
  );
  if (status === 404 || !json) return null;
  if (status < 200 || status >= 300) return null;

  const tagName = String(json.tag_name || "").trim();
  if (!tagName) return null;

  const assets: ReleaseAsset[] = [];
  const rawAssets = Array.isArray(json.assets) ? json.assets : [];
  for (const asset of rawAssets) {
    const name = String(asset.name || "").trim();
    const downloadUrl = String(asset.browser_download_url || "").trim();
    if (name && downloadUrl) {
      assets.push({ name, downloadUrl });
    }
  }

  return {
    tagName,
    name: String(json.name || tagName),
    prerelease: Boolean(json.prerelease),
    publishedAt: String(json.published_at || ""),
    notes: String(json.body || ""),
    assets,
  };
}

export async function mapPool<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const runners = Array.from({ length: Math.max(1, limit) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await worker(items[i], i);
    }
  });
  await Promise.all(runners);
  return out;
}
