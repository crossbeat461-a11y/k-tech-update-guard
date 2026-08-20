import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
import { FUNDING_URL } from "./constants";
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
    containerEl.createEl("h2", {
      text: t("K-Tech Plugin Guard", "K-Tech Plugin Guard"),
    });

    new Setting(containerEl)
      .setName(t("起動時に確認する", "Check on startup"))
      .setDesc(
        t(
          "オフのときは、ボタンまたはコマンドでのみ GitHub を見に行きます。",
          "When off, GitHub is contacted only from the button or command."
        )
      )
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.checkOnStartup);
        toggle.onChange(async (value) => {
          this.plugin.settings.checkOnStartup = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName(t("無効プラグインは対象外", "Ignore disabled plugins"))
      .setDesc(
        t(
          "Lazy Loader があるときは、そちらの「無効」だけを無効とみなします（遅延読み込みは対象に残します）。",
          "With Lazy Loader, only plugins it marks Disabled are skipped. Delayed plugins stay included."
        )
      )
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.ignoreDisabled);
        toggle.onChange(async (value) => {
          this.plugin.settings.ignoreDisabled = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName(t("ベータ版を出さない", "Hide beta versions"))
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.ignoreBeta);
        toggle.onChange(async (value) => {
          this.plugin.settings.ignoreBeta = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName(t("公開から何日待つか", "Days to wait after a release"))
      .setDesc(
        t(
          "0 なら、確認した時点の最新を出します。",
          "0 shows a release as soon as this check finds it."
        )
      )
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
      .setName(t("遅延読み込みの扱い", "Delayed plugin handling"))
      .setDesc(
        t(
          "Lazy Loader 利用時に、まだ読み込まれていないプラグインを無効と誤らないための方法です。",
          "Avoid treating Lazy Loader delayed plugins as disabled."
        )
      )
      .addDropdown((dropdown) => {
        dropdown.addOption(
          "lazy-config",
          t("Lazy Loader の設定を読む（推奨）", "Read Lazy Loader settings (recommended)")
        );
        dropdown.addOption(
          "wait-loaded",
          t("読み込み完了まで待つ", "Wait until delayed plugins load")
        );
        dropdown.addOption(
          "fixed-delay",
          t("固定秒数待つ", "Wait a fixed number of seconds")
        );
        dropdown.addOption("none", t("待たない", "Do not wait"));
        dropdown.setValue(this.plugin.settings.lazyStrategy);
        dropdown.onChange(async (value) => {
          this.plugin.settings.lazyStrategy = value as LazyStrategy;
          await this.plugin.saveSettings();
          this.display();
        });
      });

    if (this.plugin.settings.lazyStrategy === "fixed-delay") {
      new Setting(containerEl)
        .setName(t("待機秒数", "Wait seconds"))
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
        .setName(t("待ち時間の上限（秒）", "Wait timeout (seconds)"))
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
      .setName(t("GitHub トークン（任意）", "GitHub token (optional)"))
      .setDesc(
        t(
          "未認証は1時間あたり約60回です。多いときは Fine-grained または classic の PAT をローカルにだけ保存します。作者サーバーには送りません。",
          "Unauthenticated checks are about 60 GitHub requests per hour. A PAT is stored locally only and is never sent to a K-Tech server."
        )
      )
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
      .setName("Buy Me a Coffee")
      .setDesc(
        t(
          "開発支援は任意です。",
          "Support is optional."
        )
      )
      .addButton((button) => {
        button.setButtonText("Buy Me a Coffee");
        button.setCta();
        button.onClick(() => {
          window.open(FUNDING_URL, "_blank");
        });
      });
  }
}
