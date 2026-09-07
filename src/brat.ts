import type { App } from "obsidian";

const BRAT_PLUGIN_IDS = ["obsidian42-brat", "brat"];

function normalizeBratRepo(raw: string): string {
  const trimmed = raw.trim().replace(/\.git$/i, "");
  const fromUrl = /github\.com\/([^/]+\/[^/#?]+)/i.exec(trimmed);
  const candidate = fromUrl ? fromUrl[1] : trimmed;
  const repo = candidate.replace(/\/+$/, "");
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) return "";
  return repo.toLowerCase();
}

function collectRepos(list: unknown, out: Set<string>): void {
  if (!Array.isArray(list)) return;
  for (const row of list) {
    if (typeof row === "string") {
      const repo = normalizeBratRepo(row);
      if (repo) out.add(repo);
      continue;
    }
    if (!row || typeof row !== "object") continue;
    const rec = row as Record<string, unknown>;
    const repo = normalizeBratRepo(String(rec.repo || rec.plugin || ""));
    if (repo) out.add(repo);
  }
}

export async function readBratRepos(app: App): Promise<Set<string>> {
  const repos = new Set<string>();
  for (const id of BRAT_PLUGIN_IDS) {
    const path = `${app.vault.configDir}/plugins/${id}/data.json`;
    try {
      if (!(await app.vault.adapter.exists(path))) continue;
      const raw = await app.vault.adapter.read(path);
      const json = JSON.parse(raw) as {
        pluginList?: unknown;
        themesList?: unknown;
      };
      collectRepos(json.pluginList, repos);
      collectRepos(json.themesList, repos);
    } catch {
      /* missing or unreadable BRAT settings */
    }
  }
  return repos;
}

export function isBratManaged(repo: string, bratRepos: Set<string>): boolean {
  return bratRepos.has(repo.trim().toLowerCase());
}
