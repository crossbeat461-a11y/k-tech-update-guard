import type { App } from "obsidian";
import { PLUGIN_ID } from "./constants";
import { fetchText, RateLimitError } from "./github";
import { t } from "./i18n";
import { getPluginsApi } from "./plugins-api";
import type { AvailableUpdate } from "./types";
import { isNewerVersion, normalizeVersion } from "./version";

function assetUrl(update: AvailableUpdate, fileName: string): string | null {
  const found = update.assets.find((a) => a.name === fileName);
  if (found) return found.downloadUrl;
  if (fileName === "styles.css") return null;
  return `https://github.com/${update.repo}/releases/download/${update.tagName}/${fileName}`;
}

export function isSelfUpdate(id: string): boolean {
  return id === PLUGIN_ID;
}

export function reloadObsidian(app: App): void {
  const commands = (
    app as App & {
      commands?: { executeCommandById(id: string): boolean };
    }
  ).commands;
  if (commands && commands.executeCommandById("app:reload")) return;
  window.location.reload();
}

export async function installUpdate(
  app: App,
  update: AvailableUpdate,
  token: string
): Promise<void> {
  const mainUrl = assetUrl(update, "main.js");
  const manifestUrl = assetUrl(update, "manifest.json");
  if (!mainUrl || !manifestUrl) {
    throw new Error(t("missingReleaseFiles"));
  }
  const mainJs = await fetchText(mainUrl, token);
  const manifest = await fetchText(manifestUrl, token);
  if (!mainJs || !manifest || /^\s*</.test(mainJs) || /^\s*</.test(manifest)) {
    throw new Error(t("missingReleaseFiles"));
  }
  try {
    JSON.parse(manifest);
  } catch {
    throw new Error(t("missingReleaseFiles"));
  }
  let styles: string | null = null;
  const stylesUrl = assetUrl(update, "styles.css");
  if (stylesUrl) {
    try {
      styles = await fetchText(stylesUrl, token);
    } catch (err) {
      if (err instanceof RateLimitError) throw err;
      styles = null;
    }
  }

  const self = isSelfUpdate(update.id);
  const api = getPluginsApi(app);
  const wasEnabled = api.enabledPlugins.has(update.id);
  if (!self && wasEnabled) {
    await api.disablePlugin(update.id);
  }

  const dir = `${app.vault.configDir}/plugins/${update.id}`;
  if (!(await app.vault.adapter.exists(dir))) {
    await app.vault.adapter.mkdir(dir);
  }
  await app.vault.adapter.write(`${dir}/main.js`, mainJs);
  await app.vault.adapter.write(`${dir}/manifest.json`, manifest);
  if (styles != null && styles.length) {
    await app.vault.adapter.write(`${dir}/styles.css`, styles);
  }

  let writtenVersion = "";
  try {
    const writtenRaw = await app.vault.adapter.read(`${dir}/manifest.json`);
    writtenVersion = String(
      (JSON.parse(writtenRaw) as { version?: string }).version || ""
    ).trim();
  } catch {
    writtenVersion = "";
  }
  const actual = normalizeVersion(writtenVersion);
  const expected = normalizeVersion(update.latestVersion);
  if (
    !actual ||
    (actual !== expected && !isNewerVersion(actual, update.currentVersion))
  ) {
    throw new Error(
      t("installVerifyFailed", {
        name: update.name,
        version: writtenVersion || update.currentVersion,
      })
    );
  }
  const installedManifest = api.manifests[update.id];
  if (installedManifest) {
    installedManifest.version = writtenVersion;
  }

  if (self) return;

  if (typeof api.loadManifests === "function") {
    await api.loadManifests();
  }
  if (wasEnabled) {
    await api.enablePlugin(update.id);
  }
}
