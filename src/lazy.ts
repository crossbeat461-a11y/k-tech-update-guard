import type { App } from "obsidian";
import type { GuardSettings, InstalledPluginInfo } from "./types";
import { getPluginsApi } from "./plugins-api";

type LazyStartup = "disabled" | "instant" | "short" | "long";

interface LazyPluginConfig {
  startupType?: LazyStartup;
}

interface LazyDeviceSettings {
  shortDelaySeconds?: number;
  longDelaySeconds?: number;
  defaultStartupType?: LazyStartup | null;
  plugins?: Record<string, LazyPluginConfig>;
}

interface LazyFile {
  dualConfigs?: boolean;
  desktop?: LazyDeviceSettings;
  mobile?: LazyDeviceSettings;
}

export function isMobileApp(app: App): boolean {
  const maybe = app as App & { isMobile?: boolean };
  return Boolean(maybe.isMobile);
}

export async function readLazySettings(
  app: App
): Promise<LazyDeviceSettings | null> {
  const path = `${app.vault.configDir}/plugins/lazy-plugins/data.json`;
  try {
    const exists = await app.vault.adapter.exists(path);
    if (!exists) return null;
    const raw = await app.vault.adapter.read(path);
    const data = JSON.parse(raw) as LazyFile;
    if (data.dualConfigs && isMobileApp(app) && data.mobile) {
      return data.mobile;
    }
    return data.desktop || data.mobile || null;
  } catch {
    return null;
  }
}

export function lazyStartupFor(
  pluginId: string,
  lazy: LazyDeviceSettings | null
): LazyStartup | null {
  if (!lazy) return null;
  const configured = lazy.plugins?.[pluginId]?.startupType;
  if (configured) return configured;
  if (lazy.defaultStartupType) return lazy.defaultStartupType;
  return null;
}

export function isEffectivelyDisabled(
  plugin: InstalledPluginInfo,
  settings: GuardSettings,
  lazy: LazyDeviceSettings | null
): boolean {
  if (!settings.ignoreDisabled) return false;
  if (settings.lazyStrategy === "lazy-config" && lazy) {
    const startup = lazyStartupFor(plugin.id, lazy);
    if (startup === "disabled") return true;
    if (startup === "instant" || startup === "short" || startup === "long") {
      return false;
    }
  }
  return !plugin.enabled;
}

export function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function applyLazyWait(
  app: App,
  settings: GuardSettings,
  pendingIds: string[],
  _lazy: LazyDeviceSettings | null
): Promise<void> {
  if (settings.lazyStrategy === "none") return;
  if (settings.lazyStrategy === "fixed-delay") {
    await waitMs(Math.max(0, settings.fixedDelaySeconds) * 1000);
    return;
  }
  if (settings.lazyStrategy !== "wait-loaded") return;
  const timeout = Math.max(1, settings.waitLoadedTimeoutSeconds) * 1000;
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const api = getPluginsApi(app);
    const remaining = pendingIds.filter((id) => !api.plugins[id]);
    if (!remaining.length) return;
    await waitMs(400);
  }
}

export function pendingLazyIds(
  plugins: InstalledPluginInfo[],
  lazy: LazyDeviceSettings | null,
  apiPlugins: Record<string, unknown>
): string[] {
  if (!lazy) return [];
  return plugins
    .filter((p) => {
      const startup = lazyStartupFor(p.id, lazy);
      if (startup !== "short" && startup !== "long") return false;
      return !apiPlugins[p.id];
    })
    .map((p) => p.id);
}
