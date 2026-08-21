export type LazyStrategy = "lazy-config" | "wait-loaded" | "fixed-delay" | "none";

export type ItemKind = "plugin" | "theme";

export interface IgnoredItem {
  key: string;
  name: string;
}

export interface GuardSettings {
  githubToken: string;
  ignoreDisabled: boolean;
  ignoreBeta: boolean;
  daysUntilShow: number;
  lazyStrategy: LazyStrategy;
  fixedDelaySeconds: number;
  waitLoadedTimeoutSeconds: number;
  checkOnStartup: boolean;
  checkThemes: boolean;
  ignoredItems: IgnoredItem[];
}

export const DEFAULT_SETTINGS: GuardSettings = {
  githubToken: "",
  ignoreDisabled: true,
  ignoreBeta: true,
  daysUntilShow: 0,
  lazyStrategy: "lazy-config",
  fixedDelaySeconds: 8,
  waitLoadedTimeoutSeconds: 25,
  checkOnStartup: false,
  checkThemes: true,
  ignoredItems: [],
};

export interface PluginStorage {
  settings: GuardSettings;
  lastSeenVersion?: string;
}

function asIgnoredItems(raw: unknown): IgnoredItem[] {
  if (!Array.isArray(raw)) return [];
  const out: IgnoredItem[] = [];
  const seen = new Set<string>();
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const rec = row as Record<string, unknown>;
    const key = String(rec.key || "").trim();
    const name = String(rec.name || key).trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push({ key, name });
  }
  return out;
}

export function parseStorage(raw: unknown): PluginStorage {
  if (!raw || typeof raw !== "object") {
    return { settings: { ...DEFAULT_SETTINGS } };
  }
  const data = raw as Record<string, unknown>;
  if ("settings" in data && data.settings && typeof data.settings === "object") {
    const merged = Object.assign({}, DEFAULT_SETTINGS, data.settings) as GuardSettings;
    merged.ignoredItems = asIgnoredItems(
      (data.settings as { ignoredItems?: unknown }).ignoredItems
    );
    return {
      settings: merged,
      lastSeenVersion:
        typeof data.lastSeenVersion === "string" ? data.lastSeenVersion : undefined,
    };
  }
  const merged = Object.assign({}, DEFAULT_SETTINGS, data) as GuardSettings;
  merged.ignoredItems = asIgnoredItems((data as { ignoredItems?: unknown }).ignoredItems);
  return {
    settings: merged,
    lastSeenVersion: undefined,
  };
}

export function toStorage(
  settings: GuardSettings,
  lastSeenVersion?: string
): PluginStorage {
  return { settings, lastSeenVersion };
}

export function itemKey(kind: ItemKind, id: string): string {
  return kind === "theme" ? `theme:${id}` : `plugin:${id}`;
}

export function isIgnored(settings: GuardSettings, key: string): boolean {
  return settings.ignoredItems.some((item) => item.key === key);
}

export interface CommunityPluginEntry {
  id: string;
  name?: string;
  repo: string;
}

export interface CommunityThemeEntry {
  name: string;
  repo: string;
}

export interface InstalledPluginInfo {
  id: string;
  name: string;
  version: string;
  dir: string;
  enabled: boolean;
  kind: ItemKind;
  repo?: string;
}

export interface AvailableUpdate {
  id: string;
  name: string;
  currentVersion: string;
  latestVersion: string;
  repo: string;
  tagName: string;
  publishedAt: string;
  notes: string;
  isBeta: boolean;
  daysOld: number;
  assets: ReleaseAsset[];
  tooNew: boolean;
  kind: ItemKind;
  key: string;
}

export interface ReleaseAsset {
  name: string;
  downloadUrl: string;
}

export interface BackupRecord {
  key: string;
  name: string;
  kind: ItemKind;
  id: string;
  fromVersion: string;
  toVersion: string;
  files: string[];
  savedAt: string;
  destDir: string;
}

export interface CheckResult {
  updates: AvailableUpdate[];
  skipped: number;
  errors: string[];
  rateLimited: boolean;
}
