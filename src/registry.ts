import { COMMUNITY_PLUGINS_URL } from "./constants";
import { fetchJson } from "./github";
import type { CommunityPluginEntry } from "./types";

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
    if (id && repo && repo.indexOf("/") !== -1) {
      map.set(id, repo);
    }
  }
  return map;
}
