import type { App } from "obsidian";
import { CHECK_CONCURRENCY, OWN_REPO, PLUGIN_ID } from "./constants";
import {
  defaultReleaseAssets,
  fetchLatestManifest,
  fetchLatestRelease,
  isGithubRepo,
  mapPool,
  RateLimitError,
} from "./github";
import {
  applyLazyWait,
  isEffectivelyDisabled,
  pendingLazyIds,
  readLazySettings,
} from "./lazy";
import { getPluginsApi } from "./plugins-api";
import { loadCommunityRegistry, loadCommunityThemes } from "./registry";
import { t } from "./i18n";
import type {
  AvailableUpdate,
  CheckResult,
  GuardSettings,
  InstalledPluginInfo,
  ItemKind,
} from "./types";
import { itemKey, isIgnored } from "./types";
import { daysSince, isBetaVersion, isNewerVersion, normalizeVersion } from "./version";

function baseName(path: string): string {
  const parts = path.replace(/\\/g, "/").split("/").filter(Boolean);
  return parts[parts.length - 1] || path;
}

export async function listInstalled(app: App): Promise<InstalledPluginInfo[]> {
  const api = getPluginsApi(app);
  const configDir = app.vault.configDir;
  const out: InstalledPluginInfo[] = [];
  for (const id of Object.keys(api.manifests)) {
    const manifest = api.manifests[id];
    if (!manifest) continue;
    const dir = `${configDir}/plugins/${manifest.id}`;
    let version = manifest.version || "0";
    try {
      const raw = await app.vault.adapter.read(`${dir}/manifest.json`);
      const parsed = JSON.parse(raw) as { version?: string };
      if (parsed.version) version = parsed.version;
    } catch {
      /* keep in-memory version */
    }
    out.push({
      id: manifest.id,
      name: manifest.name || manifest.id,
      version,
      dir,
      enabled: api.enabledPlugins.has(manifest.id),
      kind: "plugin",
    });
  }
  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

export async function listInstalledThemes(app: App): Promise<InstalledPluginInfo[]> {
  const themesDir = `${app.vault.configDir}/themes`;
  const out: InstalledPluginInfo[] = [];
  try {
    if (!(await app.vault.adapter.exists(themesDir))) return out;
    const listed = await app.vault.adapter.list(themesDir);
    const folders = listed.folders || [];
    for (const folder of folders) {
      const id = baseName(folder);
      if (!id) continue;
      let name = id;
      let version = "0";
      try {
        const raw = await app.vault.adapter.read(`${folder}/manifest.json`);
        const parsed = JSON.parse(raw) as { name?: string; version?: string };
        if (parsed.name) name = parsed.name;
        if (parsed.version) version = parsed.version;
      } catch {
        /* folder without a readable manifest */
      }
      out.push({
        id,
        name,
        version,
        dir: folder,
        enabled: true,
        kind: "theme",
      });
    }
  } catch {
    return out;
  }
  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

async function evaluateRemote(
  item: InstalledPluginInfo,
  repo: string,
  settings: GuardSettings,
  state: { rateLimited: boolean; errors: string[]; skipped: number }
): Promise<AvailableUpdate | null> {
  const kind: ItemKind = item.kind || "plugin";
  const key = itemKey(kind, item.id);
  if (isIgnored(settings, key)) {
    state.skipped += 1;
    return null;
  }
  if (!isGithubRepo(repo)) {
    state.skipped += 1;
    return null;
  }

  const remote = await fetchLatestManifest(repo, settings.githubToken);
  let latestVersion = remote ? normalizeVersion(remote.version) : "";
  let tagName = latestVersion;
  let notes = "";
  let publishedAt = "";
  let prerelease = false;
  let assets = defaultReleaseAssets(repo, kind);

  if (!latestVersion) {
    if (state.rateLimited) {
      state.skipped += 1;
      return null;
    }
    const release = await fetchLatestRelease(repo, settings.githubToken);
    if (!release) {
      state.skipped += 1;
      return null;
    }
    latestVersion = normalizeVersion(release.tagName);
    tagName = release.tagName;
    notes = release.notes || "";
    publishedAt = release.publishedAt;
    prerelease = release.prerelease;
    if (release.assets.length) assets = release.assets;
  }

  if (!isNewerVersion(latestVersion, item.version)) return null;

  if (!notes && !state.rateLimited) {
    try {
      const release = await fetchLatestRelease(repo, settings.githubToken);
      if (release) {
        tagName = release.tagName || tagName;
        notes = release.notes || "";
        publishedAt = release.publishedAt;
        prerelease = release.prerelease;
        if (release.assets.length) assets = release.assets;
      }
    } catch (err) {
      if (err instanceof RateLimitError) {
        state.rateLimited = true;
        state.errors.push(t("rateLimitedLong"));
      } else {
        throw err;
      }
    }
  }

  const beta = prerelease || isBetaVersion(latestVersion, tagName, notes);
  if (settings.ignoreBeta && beta) return null;

  const daysOld = publishedAt ? daysSince(publishedAt) : 0;
  const tooNew =
    settings.daysUntilShow > 0 &&
    Boolean(publishedAt) &&
    daysOld < settings.daysUntilShow;
  if (tooNew) return null;

  return {
    id: item.id,
    name: item.name,
    currentVersion: item.version,
    latestVersion,
    repo,
    tagName,
    publishedAt,
    notes,
    isBeta: beta,
    daysOld,
    assets,
    tooNew: false,
    kind,
    key,
  };
}

export async function checkForUpdates(
  app: App,
  settings: GuardSettings
): Promise<CheckResult> {
  const lazy = await readLazySettings(app);
  let installed = await listInstalled(app);
  const api = getPluginsApi(app);
  const pending = pendingLazyIds(installed, lazy, api.plugins);
  await applyLazyWait(app, settings, pending, lazy);
  installed = await listInstalled(app);

  const registry = await loadCommunityRegistry();
  const pluginCandidates = installed.filter(
    (plugin) => !isEffectivelyDisabled(plugin, settings, lazy)
  );

  const updates: AvailableUpdate[] = [];
  const state = {
    errors: [] as string[],
    skipped: installed.length - pluginCandidates.length,
    rateLimited: false,
  };

  await mapPool(pluginCandidates, CHECK_CONCURRENCY, async (plugin) => {
    const repo = plugin.id === PLUGIN_ID ? OWN_REPO : registry.get(plugin.id);
    if (!repo) {
      state.skipped += 1;
      return;
    }
    try {
      const found = await evaluateRemote(plugin, repo, settings, state);
      if (found) updates.push(found);
    } catch (err) {
      if (err instanceof RateLimitError) {
        state.rateLimited = true;
        state.errors.push(t("rateLimitedLong"));
        return;
      }
      state.errors.push(
        `${plugin.name}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  });

  if (settings.checkThemes) {
    const themeRegistry = await loadCommunityThemes();
    const themes = await listInstalledThemes(app);
    await mapPool(themes, CHECK_CONCURRENCY, async (theme) => {
      const repo = themeRegistry.get(theme.id) || themeRegistry.get(theme.name);
      if (!repo) {
        state.skipped += 1;
        return;
      }
      try {
        const found = await evaluateRemote(theme, repo, settings, state);
        if (found) updates.push(found);
      } catch (err) {
        if (err instanceof RateLimitError) {
          state.rateLimited = true;
          state.errors.push(t("rateLimitedLong"));
          return;
        }
        state.errors.push(
          `${theme.name}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    });
  }

  updates.sort((a, b) => a.name.localeCompare(b.name));
  return {
    updates,
    skipped: state.skipped,
    errors: state.errors,
    rateLimited: state.rateLimited,
  };
}
