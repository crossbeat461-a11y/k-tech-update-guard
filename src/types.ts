export type LazyStrategy = "lazy-config" | "wait-loaded" | "fixed-delay" | "none";

export interface GuardSettings {
  githubToken: string;
  ignoreDisabled: boolean;
  ignoreBeta: boolean;
  daysUntilShow: number;
  lazyStrategy: LazyStrategy;
  fixedDelaySeconds: number;
  waitLoadedTimeoutSeconds: number;
  checkOnStartup: boolean;
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
};

export interface PluginStorage {
  settings: GuardSettings;
  lastSeenVersion?: string;
}

export function parseStorage(raw: unknown): PluginStorage {
  if (!raw || typeof raw !== "object") {
    return { settings: { ...DEFAULT_SETTINGS } };
  }
  const data = raw as Record<string, unknown>;
  if ("settings" in data && data.settings && typeof data.settings === "object") {
    return {
      settings: Object.assign({}, DEFAULT_SETTINGS, data.settings),
      lastSeenVersion:
        typeof data.lastSeenVersion === "string" ? data.lastSeenVersion : undefined,
    };
  }
  return {
    settings: Object.assign({}, DEFAULT_SETTINGS, data),
    lastSeenVersion: undefined,
  };
}

export function toStorage(
  settings: GuardSettings,
  lastSeenVersion?: string
): PluginStorage {
  return { settings, lastSeenVersion };
}

export interface CommunityPluginEntry {
  id: string;
  name?: string;
  repo: string;
}

export interface InstalledPluginInfo {
  id: string;
  name: string;
  version: string;
  dir: string;
  enabled: boolean;
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
}

export interface ReleaseAsset {
  name: string;
  downloadUrl: string;
}

export interface CheckResult {
  updates: AvailableUpdate[];
  skipped: number;
  errors: string[];
  rateLimited: boolean;
}
