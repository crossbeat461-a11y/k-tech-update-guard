import type { App } from "obsidian";
import { restoreBackup, saveBackup } from "./backup";
import {
  PLUGIN_ID,
  PLUGIN_RELEASE_FILES,
  THEME_RELEASE_FILES,
} from "./constants";
import { fetchText, githubTagFileUrl, RateLimitError } from "./github";
import { t } from "./i18n";
import { getPluginsApi } from "./plugins-api";
import type { AvailableUpdate, ItemKind } from "./types";
import { isNewerVersion, normalizeVersion } from "./version";

function assetUrl(update: AvailableUpdate, fileName: string): string | null {
  const found = update.assets.find((a) => a.name === fileName);
  if (found) return found.downloadUrl;
  const optional =
    fileName === "styles.css" ||
    fileName === "obsidian.css" ||
    (update.kind === "theme" && fileName === "theme.css");
  if (optional && fileName !== "theme.css") return null;
  if (!update.tagName) return null;
  return githubTagFileUrl(update.repo, update.tagName, fileName);
}

export function isSelfUpdate(id: string, kind: ItemKind = "plugin"): boolean {
  return kind === "plugin" && id === PLUGIN_ID;
}

export function destDirFor(app: App, kind: ItemKind, id: string): string {
  if (kind === "theme") return `${app.vault.configDir}/themes/${id}`;
  return `${app.vault.configDir}/plugins/${id}`;
}

export function releaseFilesFor(kind: ItemKind): readonly string[] {
  return kind === "theme" ? THEME_RELEASE_FILES : PLUGIN_RELEASE_FILES;
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

async function reloadTheme(app: App, name: string): Promise<void> {
  const css = (
    app as App & {
      customCss?: {
        readThemes?: () => void | Promise<void>;
        setTheme?: (theme: string) => void;
        theme?: string;
      };
    }
  ).customCss;
  if (!css) return;
  if (typeof css.readThemes === "function") {
    await css.readThemes();
  }
  if (css.theme === name && typeof css.setTheme === "function") {
    css.setTheme(name);
  }
}

async function downloadText(
  url: string | null,
  token: string,
  required: boolean
): Promise<string | null> {
  if (!url) {
    if (required) throw new Error(t("missingReleaseFiles"));
    return null;
  }
  try {
    const text = await fetchText(url, token);
    if (!text || /^\s*</.test(text)) {
      if (required) throw new Error(t("missingReleaseFiles"));
      return null;
    }
    return text;
  } catch (err) {
    if (err instanceof RateLimitError) throw err;
    if (required) throw err;
    return null;
  }
}

export async function installUpdate(
  app: App,
  update: AvailableUpdate,
  token: string
): Promise<void> {
  const kind = update.kind || "plugin";
  const dir = destDirFor(app, kind, update.id);
  const files = releaseFilesFor(kind);

  const manifestUrl = assetUrl(update, "manifest.json");
  const manifest = await downloadText(manifestUrl, token, true);
  if (!manifest) throw new Error(t("missingReleaseFiles"));
  let parsed: { id?: string; name?: string; version?: string };
  try {
    parsed = JSON.parse(manifest) as { id?: string; name?: string; version?: string };
  } catch {
    throw new Error(t("missingReleaseFiles"));
  }
  if (kind === "plugin" && parsed.id && parsed.id !== update.id) {
    throw new Error(t("missingReleaseFiles"));
  }

  let mainJs: string | null = null;
  let styles: string | null = null;
  let themeCss: string | null = null;
  let legacyCss: string | null = null;

  if (kind === "plugin") {
    mainJs = await downloadText(assetUrl(update, "main.js"), token, true);
    styles = await downloadText(assetUrl(update, "styles.css"), token, false);
    if (!mainJs) throw new Error(t("missingReleaseFiles"));
  } else {
    themeCss = await downloadText(assetUrl(update, "theme.css"), token, false);
    legacyCss = await downloadText(assetUrl(update, "obsidian.css"), token, false);
    if (!themeCss && !legacyCss) {
      throw new Error(t("missingThemeFiles"));
    }
  }

  const self = isSelfUpdate(update.id, kind);
  const api = kind === "plugin" ? getPluginsApi(app) : null;
  const wasEnabled = Boolean(api && api.enabledPlugins.has(update.id));
  if (api && !self && wasEnabled) {
    await api.disablePlugin(update.id);
  }

  if (!(await app.vault.adapter.exists(dir))) {
    await app.vault.adapter.mkdir(dir);
  }

  await saveBackup(
    app,
    {
      key: update.key,
      name: update.name,
      kind,
      id: update.id,
      fromVersion: update.currentVersion,
      toVersion: update.latestVersion,
      destDir: dir,
    },
    dir,
    [...files]
  );

  const write = async (name: string, body: string) => {
    await app.vault.adapter.write(`${dir}/${name}`, body);
  };

  try {
    await write("manifest.json", manifest);
    if (kind === "plugin") {
      if (mainJs) await write("main.js", mainJs);
      if (styles != null && styles.length) await write("styles.css", styles);
    } else {
      if (themeCss) await write("theme.css", themeCss);
      if (legacyCss) await write("obsidian.css", legacyCss);
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
    if (api) {
      const installedManifest = api.manifests[update.id];
      if (installedManifest) {
        installedManifest.version = writtenVersion;
      }
    }
  } catch (err) {
    try {
      await restoreBackup(app, update.key);
    } catch {
      /* keep original error */
    }
    throw err;
  }

  if (self) return;

  if (kind === "theme") {
    await reloadTheme(app, update.id);
    return;
  }

  if (api && typeof api.loadManifests === "function") {
    await api.loadManifests();
  }
  if (api && wasEnabled) {
    await api.enablePlugin(update.id);
  }
}

export async function rollbackUpdate(app: App, key: string): Promise<BackupRecordName> {
  const meta = await restoreBackup(app, key);
  if (meta.kind === "plugin") {
    const api = getPluginsApi(app);
    if (typeof api.loadManifests === "function") {
      await api.loadManifests();
    }
    const installedManifest = api.manifests[meta.id];
    if (installedManifest) {
      installedManifest.version = meta.fromVersion;
    }
  } else {
    await reloadTheme(app, meta.id);
  }
  return { name: meta.name, kind: meta.kind, id: meta.id };
}

export interface BackupRecordName {
  name: string;
  kind: ItemKind;
  id: string;
}
