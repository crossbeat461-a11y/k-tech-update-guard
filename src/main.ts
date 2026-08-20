import { Notice, Plugin } from "obsidian";
import { checkForUpdates } from "./check";
import { PLUGIN_NAME } from "./constants";
import { openFundingModal } from "./funding";
import { t } from "./i18n";
import { NoUpdatesModal, UpdatesModal } from "./modals";
import { GuardSettingTab } from "./settings";
import {
  DEFAULT_SETTINGS,
  parseStorage,
  toStorage,
  type GuardSettings,
} from "./types";

export default class KTechPluginGuard extends Plugin {
  settings: GuardSettings = DEFAULT_SETTINGS;
  private lastSeenVersion?: string;
  private checking = false;
  private statusEl: HTMLElement | null = null;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.statusEl = this.addStatusBarItem();
    this.statusEl.addClass("ktech-guard-status");
    this.setStatus(t("確認", "Check"));
    this.statusEl.addEventListener("click", () => {
      void this.runCheck();
    });

    this.addRibbonIcon("shield-check", PLUGIN_NAME, () => {
      void this.runCheck();
    });

    this.addCommand({
      id: "check-plugin-updates",
      name: t("プラグインの更新を確認", "Check for plugin updates"),
      callback: () => {
        void this.runCheck();
      },
    });

    this.addSettingTab(new GuardSettingTab(this.app, this));

    this.app.workspace.onLayoutReady(() => {
      void this.maybeShowFundingModal();
      if (this.settings.checkOnStartup) {
        void this.runCheck();
      }
    });
  }

  onunload(): void {
    this.statusEl = null;
  }

  async loadSettings(): Promise<void> {
    const storage = parseStorage(await this.loadData());
    this.settings = storage.settings;
    this.lastSeenVersion = storage.lastSeenVersion;
  }

  async saveSettings(): Promise<void> {
    await this.saveData(toStorage(this.settings, this.lastSeenVersion));
  }

  private setStatus(text: string): void {
    if (!this.statusEl) return;
    this.statusEl.setText(`Guard ${text}`);
    this.statusEl.setAttribute("aria-label", `${PLUGIN_NAME}: ${text}`);
  }

  private async maybeShowFundingModal(): Promise<void> {
    const currentVersion = this.manifest.version;
    if (this.lastSeenVersion === currentVersion) return;
    const kind = this.lastSeenVersion ? "update" : "install";
    window.setTimeout(() => {
      openFundingModal(this.app, kind, currentVersion);
    }, 800);
    this.lastSeenVersion = currentVersion;
    await this.saveSettings();
  }

  async runCheck(): Promise<void> {
    if (this.checking) {
      new Notice(t("すでに確認中です", "Already checking"));
      return;
    }
    this.checking = true;
    this.setStatus(t("確認中…", "Checking…"));
    new Notice(t("プラグインの更新を確認しています…", "Checking plugin updates…"));
    try {
      const result = await checkForUpdates(this.app, this.settings);
      const extra: string[] = [];
      if (result.rateLimited) {
        extra.push(
          t(
            "GitHub の回数制限に達しました。設定のトークンを使うか、時間をおいて再試行してください。",
            "GitHub rate limit reached. Add a token in settings, or try again later."
          )
        );
      }
      for (const err of result.errors) extra.push(err);

      if (!result.updates.length) {
        this.setStatus(t("最新", "Up to date"));
        new NoUpdatesModal(this.app, extra).open();
        return;
      }

      this.setStatus(String(result.updates.length));
      new UpdatesModal(
        this.app,
        result.updates,
        this.settings.githubToken,
        extra,
        () => {
          this.setStatus(t("確認", "Check"));
        }
      ).open();
    } catch (err) {
      this.setStatus(t("エラー", "Error"));
      new Notice(
        t(
          `確認に失敗しました: ${err instanceof Error ? err.message : String(err)}`,
          `Check failed: ${err instanceof Error ? err.message : String(err)}`
        ),
        8000
      );
    } finally {
      this.checking = false;
    }
  }
}
