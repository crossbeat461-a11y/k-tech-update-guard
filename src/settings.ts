import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
import { FUNDING_URL, PLUGIN_NAME } from "./constants";
import { t } from "./i18n";
import type { GuardSettings, LazyStrategy } from "./types";

interface GuardPluginHost {
  settings: GuardSettings;
  saveSettings(): Promise<void>;
}

export class GuardSettingTab extends PluginSettingTab {
  constructor(
    app: App,
    private readonly plugin: Plugin & GuardPluginHost
  ) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: PLUGIN_NAME });

    new Setting(containerEl)
      .setName(t("checkOnStartup"))
      .setDesc(t("checkOnStartupDesc"))
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.checkOnStartup);
        toggle.onChange(async (value) => {
          this.plugin.settings.checkOnStartup = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName(t("ignoreDisabled"))
      .setDesc(t("ignoreDisabledDesc"))
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.ignoreDisabled);
        toggle.onChange(async (value) => {
          this.plugin.settings.ignoreDisabled = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName(t("hideBeta"))
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.ignoreBeta);
        toggle.onChange(async (value) => {
          this.plugin.settings.ignoreBeta = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName(t("daysWait"))
      .setDesc(t("daysWaitDesc"))
      .addSlider((slider) => {
        slider.setLimits(0, 14, 1);
        slider.setDynamicTooltip();
        slider.setValue(this.plugin.settings.daysUntilShow);
        slider.onChange(async (value) => {
          this.plugin.settings.daysUntilShow = value;
          await this.plugin.saveSettings();
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
        dropdown.setValue(this.plugin.settings.lazyStrategy);
        dropdown.onChange(async (value) => {
          this.plugin.settings.lazyStrategy = value as LazyStrategy;
          await this.plugin.saveSettings();
          this.display();
        });
      });

    if (this.plugin.settings.lazyStrategy === "fixed-delay") {
      new Setting(containerEl)
        .setName(t("waitSeconds"))
        .addSlider((slider) => {
          slider.setLimits(1, 30, 1);
          slider.setDynamicTooltip();
          slider.setValue(this.plugin.settings.fixedDelaySeconds);
          slider.onChange(async (value) => {
            this.plugin.settings.fixedDelaySeconds = value;
            await this.plugin.saveSettings();
          });
        });
    }

    if (this.plugin.settings.lazyStrategy === "wait-loaded") {
      new Setting(containerEl)
        .setName(t("waitTimeout"))
        .addSlider((slider) => {
          slider.setLimits(5, 60, 1);
          slider.setDynamicTooltip();
          slider.setValue(this.plugin.settings.waitLoadedTimeoutSeconds);
          slider.onChange(async (value) => {
            this.plugin.settings.waitLoadedTimeoutSeconds = value;
            await this.plugin.saveSettings();
          });
        });
    }

    new Setting(containerEl)
      .setName(t("githubToken"))
      .setDesc(t("githubTokenDesc"))
      .addText((text) => {
        text.inputEl.type = "password";
        text.setPlaceholder("ghp_…");
        text.setValue(this.plugin.settings.githubToken);
        text.onChange(async (value) => {
          this.plugin.settings.githubToken = value.trim();
          await this.plugin.saveSettings();
        });
      });

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
  }
}
