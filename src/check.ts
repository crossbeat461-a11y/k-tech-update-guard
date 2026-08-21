import type { App } from "obsidian";
import { CHECK_CONCURRENCY, OWN_REPO, PLUGIN_ID } from "./constants";
import {
  defaultReleaseAssets,
  fetchLatestManifest,
  fetchLatestRelease,
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
import { loadCommunityRegistry } from "./registry";
import { t } from "./i18n";
import type {
  AvailableUpdate,
  CheckResult,
  GuardSettings,
  InstalledPluginInfo,
} from "./types";
import { daysSince, isBetaVersion, isNewerVersion, normalizeVersion } from "./version";

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
    });
  }
  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
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
  const candidates = installed.filter(
    (plugin) => !isEffectivelyDisabled(plugin, settings, lazy)
  );

  const updates: AvailableUpdate[] = [];
  const errors: string[] = [];
  let skipped = installed.length - candidates.length;
  let rateLimited = false;

  await mapPool(candidates, CHECK_CONCURRENCY, async (plugin) => {
    const repo = plugin.id === PLUGIN_ID ? OWN_REPO : registry.get(plugin.id);
    if (!repo) {
      skipped += 1;
      return;
    }
    try {
      const remote = await fetchLatestManifest(repo, settings.githubToken);
      let latestVersion = remote ? normalizeVersion(remote.version) : "";
      let tagName = latestVersion;
      let notes = "";
      let publishedAt = "";
      let prerelease = false;
      let assets = defaultReleaseAssets(repo);

      if (!latestVersion) {
        if (rateLimited) {
          skipped += 1;
          return;
        }
        const release = await fetchLatestRelease(repo, settings.githubToken);
        if (!release) {
          skipped += 1;
          return;
        }
        latestVersion = normalizeVersion(release.tagName);
        tagName = release.tagName;
        notes = release.notes || "";
        publishedAt = release.publishedAt;
        prerelease = release.prerelease;
        if (release.assets.length) assets = release.assets;
      }

      if (!isNewerVersion(latestVersion, plugin.version)) return;

      if (
        !notes &&
        !rateLimited &&
        (settings.ignoreBeta || settings.daysUntilShow > 0)
      ) {
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
            rateLimited = true;
            errors.push(t("rateLimitedLong"));
          } else {
            throw err;
          }
        }
      }

      const beta =
        prerelease || isBetaVersion(latestVersion, tagName, notes);
      if (settings.ignoreBeta && beta) return;

      const daysOld = publishedAt ? daysSince(publishedAt) : 0;
      const tooNew =
        settings.daysUntilShow > 0 &&
        Boolean(publishedAt) &&
        daysOld < settings.daysUntilShow;
      if (tooNew) return;

      updates.push({
        id: plugin.id,
        name: plugin.name,
        currentVersion: plugin.version,
        latestVersion,
        repo,
        tagName,
        publishedAt,
        notes,
        isBeta: beta,
        daysOld,
        assets,
        tooNew: false,
      });
    } catch (err) {
      if (err instanceof RateLimitError) {
        rateLimited = true;
        errors.push(t("rateLimitedLong"));
        return;
      }
      errors.push(`${plugin.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  });

  updates.sort((a, b) => a.name.localeCompare(b.name));
  return { updates, skipped, errors, rateLimited };
}
