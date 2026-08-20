import type { App } from "obsidian";
import { CHECK_CONCURRENCY, OWN_REPO, PLUGIN_ID } from "./constants";
import { fetchLatestRelease, mapPool, RateLimitError } from "./github";
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

export function listInstalled(app: App): InstalledPluginInfo[] {
  const api = getPluginsApi(app);
  const configDir = app.vault.configDir;
  const out: InstalledPluginInfo[] = [];
  for (const id of Object.keys(api.manifests)) {
    const manifest = api.manifests[id];
    if (!manifest) continue;
    out.push({
      id: manifest.id,
      name: manifest.name || manifest.id,
      version: manifest.version || "0",
      dir: `${configDir}/plugins/${manifest.id}`,
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
  let installed = listInstalled(app);
  const api = getPluginsApi(app);
  const pending = pendingLazyIds(installed, lazy, api.plugins);
  await applyLazyWait(app, settings, pending, lazy);
  installed = listInstalled(app);

  const registry = await loadCommunityRegistry();
  const candidates = installed.filter(
    (plugin) => !isEffectivelyDisabled(plugin, settings, lazy)
  );

  const updates: AvailableUpdate[] = [];
  const errors: string[] = [];
  let skipped = installed.length - candidates.length;
  let rateLimited = false;

  await mapPool(candidates, CHECK_CONCURRENCY, async (plugin) => {
    if (rateLimited) return;
    const repo = plugin.id === PLUGIN_ID ? OWN_REPO : registry.get(plugin.id);
    if (!repo) {
      skipped += 1;
      return;
    }
    try {
      const release = await fetchLatestRelease(repo, settings.githubToken);
      if (!release) {
        skipped += 1;
        return;
      }
      const latestVersion = normalizeVersion(release.tagName);
      if (!isNewerVersion(latestVersion, plugin.version)) return;

      const beta = release.prerelease || isBetaVersion(latestVersion, release.name);
      if (settings.ignoreBeta && beta) return;

      const daysOld = daysSince(release.publishedAt);
      const tooNew = settings.daysUntilShow > 0 && daysOld < settings.daysUntilShow;
      if (tooNew) return;

      updates.push({
        id: plugin.id,
        name: plugin.name,
        currentVersion: plugin.version,
        latestVersion,
        repo,
        tagName: release.tagName,
        publishedAt: release.publishedAt,
        notes: release.notes || "",
        isBeta: beta,
        daysOld,
        assets: release.assets,
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
