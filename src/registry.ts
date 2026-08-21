import { COMMUNITY_PLUGINS_URL, COMMUNITY_THEMES_URL } from "./constants";
import { fetchJson, isGithubRepo } from "./github";
import type { CommunityPluginEntry, CommunityThemeEntry } from "./types";

export async function loadCommunityRegistry(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const { status, json } = await fetchJson<unknown>(COMMUNITY_PLUGINS_URL);
  if (status < 200 || status >= 300 || !Array.isArray(json)) {
    throw new Error("Could not load the community plugin directory");
  }
  for (const row of json) {
    if (!row || typeof row !== "object") continue;
    const rec = row as CommunityPluginEntry;
    const id = String(rec.id || "").trim();
    const repo = String(rec.repo || "").trim();
    if (id && isGithubRepo(repo)) {
      map.set(id, repo);
    }
  }
  return map;
}

export async function loadCommunityThemes(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const { status, json } = await fetchJson<unknown>(COMMUNITY_THEMES_URL);
  if (status < 200 || status >= 300 || !Array.isArray(json)) {
    throw new Error("Could not load the community theme directory");
  }
  for (const row of json) {
    if (!row || typeof row !== "object") continue;
    const rec = row as CommunityThemeEntry;
    const name = String(rec.name || "").trim();
    const repo = String(rec.repo || "").trim();
    if (name && isGithubRepo(repo)) {
      map.set(name, repo);
    }
  }
  return map;
}
