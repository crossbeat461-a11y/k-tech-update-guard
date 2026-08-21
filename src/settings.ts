import { App, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";
import { listBackups } from "./backup";
import { FUNDING_URL, PLUGIN_ID, PLUGIN_NAME } from "./constants";
import { t } from "./i18n";
import { isSelfUpdate, reloadObsidian, rollbackUpdate } from "./installer";
import type { GuardSettings, LazyStrategy } from "./types";

interface GuardPluginHost {
  settings: GuardSettings;
  saveSettings(): Promise<void>;
}

export class GuardSettingTab extends PluginSettingTab {
  private readonly host: GuardPluginHost;
  private busyKey = "";

  constructor(app: App, plugin: Plugin & GuardPluginHost) {
    super(app, plugin);
    this.host = plugin;
  }

  display(): void {
    const { containerEl } = this;
    const settings = this.host.settings;
    containerEl.empty();

    new Setting(containerEl).setName(PLUGIN_NAME).setHeading();

    new Setting(containerEl)
      .setName(t("checkOnStartup"))
      .setDesc(t("checkOnStartupDesc"))
      .addToggle((toggle) => {
        toggle.setValue(settings.checkOnStartup);
        toggle.onChange(async (value) => {
          settings.checkOnStartup = value;
          await this.host.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName(t("checkThemes"))
      .setDesc(t("checkThemesDesc"))
      .addToggle((toggle) => {
        toggle.setValue(settings.checkThemes);
        toggle.onChange(async (value) => {
          settings.checkThemes = value;
          await this.host.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName(t("ignoreDisabled"))
      .setDesc(t("ignoreDisabledDesc"))
      .addToggle((toggle) => {
        toggle.setValue(settings.ignoreDisabled);
        toggle.onChange(async (value) => {
          settings.ignoreDisabled = value;
          await this.host.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName(t("hideBeta"))
      .setDesc(t("hideBetaDesc"))
      .addToggle((toggle) => {
        toggle.setValue(settings.ignoreBeta);
        toggle.onChange(async (value) => {
          settings.ignoreBeta = value;
          await this.host.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName(t("daysWait"))
      .setDesc(t("daysWaitDesc"))
      .addSlider((slider) => {
        slider.setLimits(0, 14, 1);
        slider.setValue(settings.daysUntilShow);
        slider.onChange(async (value) => {
          settings.daysUntilShow = value;
          await this.host.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName(t("lazyHandling"))
      .setDesc(t("lazyHandlingDesc"))
      .addDropdown((dropdown) => {
        dropdown.addOption("lazy-config", t("lazyReadConfig"));
        dropdown.addOption("wait-loaded", t("lazyWaitLoaded"));
        dropdown.addOption("fixed-delay", t("lazyFixedDelay"));
        dropdown.addOption("none", t("lazyNone"));
        dropdown.setValue(settings.lazyStrategy);
        dropdown.onChange(async (value) => {
          settings.lazyStrategy = value as LazyStrategy;
          await this.host.saveSettings();
          this.display();
        });
      });

    if (settings.lazyStrategy === "fixed-delay") {
      new Setting(containerEl)
        .setName(t("waitSeconds"))
        .addSlider((slider) => {
          slider.setLimits(1, 30, 1);
          slider.setValue(settings.fixedDelaySeconds);
          slider.onChange(async (value) => {
            settings.fixedDelaySeconds = value;
            await this.host.saveSettings();
          });
        });
    }

    if (settings.lazyStrategy === "wait-loaded") {
      new Setting(containerEl)
        .setName(t("waitTimeout"))
        .addSlider((slider) => {
          slider.setLimits(5, 60, 1);
          slider.setValue(settings.waitLoadedTimeoutSeconds);
          slider.onChange(async (value) => {
            settings.waitLoadedTimeoutSeconds = value;
            await this.host.saveSettings();
          });
        });
    }

    new Setting(containerEl)
      .setName(t("githubToken"))
      .setDesc(t("githubTokenDesc"))
      .addText((text) => {
        text.inputEl.type = "password";
        text.setPlaceholder("ghp_…");
        text.setValue(settings.githubToken);
        text.onChange(async (value) => {
          settings.githubToken = value.trim();
          await this.host.saveSettings();
        });
      });

    new Setting(containerEl).setName(t("ignoreList")).setHeading();
    new Setting(containerEl).setName("").setDesc(t("ignoreListDesc"));
    if (!settings.ignoredItems.length) {
      containerEl.createEl("p", {
        text: t("ignoreEmpty"),
        cls: "ktech-guard-muted",
      });
    } else {
      for (const item of settings.ignoredItems) {
        new Setting(containerEl).setName(item.name).addButton((button) => {
          button.setButtonText(t("unignore"));
          button.onClick(async () => {
            settings.ignoredItems = settings.ignoredItems.filter(
              (row) => row.key !== item.key
            );
            await this.host.saveSettings();
            this.display();
          });
        });
      }
    }

    new Setting(containerEl).setName(t("rollbackHeading")).setHeading();
    new Setting(containerEl).setName("").setDesc(t("rollbackDesc"));
    const backupMount = containerEl.createDiv({ cls: "ktech-guard-backups" });

    new Setting(containerEl)
      .setName(t("bmc"))
      .setDesc(t("supportOptional"))
      .addButton((button) => {
        button.setButtonText(t("bmc"));
        button.setCta();
        button.onClick(() => {
          window.open(FUNDING_URL, "_blank");
        });
      });

    void this.renderBackups(backupMount);
  }

  private async renderBackups(mount: HTMLElement): Promise<void> {
    const backups = await listBackups(this.app);
    mount.empty();
    if (!backups.length) {
      mount.createEl("p", {
        text: t("rollbackEmpty"),
        cls: "ktech-guard-muted",
      });
      return;
    }
    for (const backup of backups) {
      const kindLabel = backup.kind === "theme" ? t("kindTheme") : t("kindPlugin");
      new Setting(mount)
        .setName(backup.name)
        .setDesc(`${kindLabel} · ${backup.toVersion} → ${backup.fromVersion}`)
        .addButton((button) => {
          button.setButtonText(t("rollbackButton"));
          button.setDisabled(this.busyKey === backup.key);
          button.onClick(() => {
            void this.restore(backup.key, backup.name, backup.id, backup.kind);
          });
        });
    }
  }

  private async restore(
    key: string,
    name: string,
    id: string,
    kind: "plugin" | "theme"
  ): Promise<void> {
    this.busyKey = key;
    this.display();
    try {
      await rollbackUpdate(this.app, key);
      new Notice(t("rolledBack", { name }));
      if (isSelfUpdate(id, kind) || id === PLUGIN_ID) {
        new Notice(t("selfUpdatedReload"));
        window.setTimeout(() => reloadObsidian(this.app), 700);
        return;
      }
    } catch (err) {
      new Notice(
        t("rollbackFailed", {
          name,
          error: err instanceof Error ? err.message : String(err),
        }),
        8000
      );
    }
    this.busyKey = "";
    this.display();
  }
}
