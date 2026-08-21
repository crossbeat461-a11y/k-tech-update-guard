import { Notice, Plugin } from "obsidian";
import { checkForUpdates } from "./check";
import { PLUGIN_NAME } from "./constants";
import { openFundingModal } from "./funding";
import { t } from "./i18n";
import { NoUpdatesModal, RollbackModal, UpdatesModal } from "./modals";
import { GuardSettingTab } from "./settings";
import {
  DEFAULT_SETTINGS,
  parseStorage,
  toStorage,
  type AvailableUpdate,
  type GuardSettings,
} from "./types";

export default class KTechUpdateGuard extends Plugin {
  settings: GuardSettings = DEFAULT_SETTINGS;
  private lastSeenVersion?: string;
  private checking = false;
  private statusEl: HTMLElement | null = null;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.statusEl = this.addStatusBarItem();
    this.statusEl.addClass("ktech-guard-status");
    this.setStatus(t("statusCheck"));
    this.statusEl.addEventListener("click", () => {
      void this.runCheck();
    });

    this.addRibbonIcon("shield-check", PLUGIN_NAME, () => {
      void this.runCheck();
    });

    this.addCommand({
      id: "check-plugin-updates",
      name: t("cmdCheck"),
      callback: () => {
        void this.runCheck();
      },
    });

    this.addCommand({
      id: "restore-previous-files",
      name: t("cmdRollback"),
      callback: () => {
        new RollbackModal(this.app, () => {
          this.setStatus(t("statusCheck"));
        }).open();
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

  private async ignoreUpdate(update: AvailableUpdate): Promise<void> {
    if (this.settings.ignoredItems.some((item) => item.key === update.key)) return;
    this.settings.ignoredItems = [
      ...this.settings.ignoredItems,
      { key: update.key, name: update.name },
    ];
    await this.saveSettings();
  }

  async runCheck(): Promise<void> {
    if (this.checking) {
      new Notice(t("alreadyChecking"));
      return;
    }
    this.checking = true;
    this.setStatus(t("statusChecking"));
    new Notice(t("checkingNotice"));
    try {
      const result = await checkForUpdates(this.app, this.settings);
      const extra: string[] = [];
      if (result.rateLimited) extra.push(t("rateLimitedLong"));
      for (const err of result.errors) extra.push(err);

      if (!result.updates.length) {
        this.setStatus(t("statusUpToDate"));
        new NoUpdatesModal(this.app, extra).open();
        return;
      }

      this.setStatus(String(result.updates.length));
      new UpdatesModal(
        this.app,
        result.updates,
        this.settings.githubToken,
        extra,
        (update) => this.ignoreUpdate(update),
        () => {
          this.setStatus(t("statusCheck"));
        }
      ).open();
    } catch (err) {
      this.setStatus(t("statusError"));
      new Notice(
        t("checkFailed", {
          error: err instanceof Error ? err.message : String(err),
        }),
        8000
      );
    } finally {
      this.checking = false;
    }
  }
}
