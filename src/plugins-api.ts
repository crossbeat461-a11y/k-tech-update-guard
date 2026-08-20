import type { App, PluginManifest } from "obsidian";

export interface PluginsApi {
  manifests: Record<string, PluginManifest>;
  enabledPlugins: Set<string>;
  plugins: Record<string, unknown>;
  disablePlugin(id: string): Promise<void>;
  enablePlugin(id: string): Promise<void>;
  loadManifests?: () => Promise<void>;
}

export function getPluginsApi(app: App): PluginsApi {
  const plugins = (app as App & { plugins?: PluginsApi }).plugins;
  if (!plugins || !plugins.manifests) {
    throw new Error("Community plugins API is not available");
  }
  return plugins;
}
