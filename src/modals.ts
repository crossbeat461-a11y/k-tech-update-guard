import { App, Modal, Notice, Setting } from "obsidian";
import { PLUGIN_NAME } from "./constants";
import { t } from "./i18n";
import { installUpdate } from "./installer";
import { RateLimitError } from "./github";
import type { AvailableUpdate } from "./types";

export class NoUpdatesModal extends Modal {
  constructor(
    app: App,
    private readonly extra: string[]
  ) {
    super(app);
  }

  onOpen(): void {
    const { contentEl, titleEl } = this;
    titleEl.setText(PLUGIN_NAME);
    contentEl.createEl("h3", {
      text: t("今のところ更新はありません", "No updates right now"),
    });
    contentEl.createEl("p", {
      text: t(
        "導入しているコミュニティプラグインは、確認した範囲では最新です。",
        "Installed community plugins are up to date for this check."
      ),
    });
    if (this.extra.length) {
      const list = contentEl.createEl("ul", { cls: "ktech-guard-notes" });
      for (const line of this.extra) {
        list.createEl("li", { text: line });
      }
    }
    const actions = contentEl.createDiv({ cls: "modal-button-container" });
    const closeBtn = actions.createEl("button", {
      cls: "mod-cta",
      text: t("閉じる", "Close"),
    });
    closeBtn.addEventListener("click", () => this.close());
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

export class UpdatesModal extends Modal {
  private selected = new Set<string>();
  private busy = false;

  constructor(
    app: App,
    private readonly updates: AvailableUpdate[],
    private readonly token: string,
    private readonly extra: string[],
    private readonly onDone: () => void
  ) {
    super(app);
    for (const update of updates) {
      this.selected.add(update.id);
    }
  }

  onOpen(): void {
    this.render();
  }

  onClose(): void {
    this.contentEl.empty();
  }

  private render(): void {
    const { contentEl, titleEl } = this;
    contentEl.empty();
    titleEl.setText(PLUGIN_NAME);

    contentEl.createEl("h3", {
      text: t(
        `${this.updates.length} 件の更新があります`,
        `${this.updates.length} update(s) available`
      ),
    });
    contentEl.createEl("p", {
      text: t(
        "入れるプラグインにチェックを付けてから更新してください。GitHub Release の配布ファイルを使います。",
        "Select the plugins to install. Files come from each GitHub Release (same as the official updater)."
      ),
    });

    if (this.extra.length) {
      const notes = contentEl.createEl("ul", { cls: "ktech-guard-notes" });
      for (const line of this.extra) {
        notes.createEl("li", { text: line });
      }
    }

    new Setting(contentEl)
      .setName(t("すべて選択", "Select all"))
      .addToggle((toggle) => {
        toggle.setValue(this.selected.size === this.updates.length);
        toggle.onChange((on) => {
          this.selected.clear();
          if (on) {
            for (const update of this.updates) this.selected.add(update.id);
          }
          this.render();
        });
      });

    for (const update of this.updates) {
      const row = new Setting(contentEl);
      row.setName(update.name);
      const beta = update.isBeta ? t("（ベータ）", " (beta)") : "";
      row.setDesc(
        `${update.currentVersion} → ${update.latestVersion}${beta}` +
          (update.notes
            ? `\n${update.notes.trim().slice(0, 280)}${update.notes.length > 280 ? "…" : ""}`
            : "")
      );
      row.addToggle((toggle) => {
        toggle.setValue(this.selected.has(update.id));
        toggle.onChange((on) => {
          if (on) this.selected.add(update.id);
          else this.selected.delete(update.id);
        });
      });
    }

    const actions = contentEl.createDiv({ cls: "modal-button-container" });
    const updateBtn = actions.createEl("button", {
      cls: "mod-cta",
      text: t("選択したプラグインを更新", "Update selected"),
    });
    updateBtn.disabled = this.busy;
    updateBtn.addEventListener("click", () => {
      void this.applySelected();
    });

    const cancelBtn = actions.createEl("button", {
      text: t("キャンセル", "Cancel"),
    });
    cancelBtn.addEventListener("click", () => this.close());
  }

  private async applySelected(): Promise<void> {
    if (this.busy) return;
    const chosen = this.updates.filter((u) => this.selected.has(u.id));
    if (!chosen.length) {
      new Notice(t("プラグインが選択されていません", "No plugins selected"));
      return;
    }
    this.busy = true;
    this.render();
    let ok = 0;
    const failed: string[] = [];
    for (const update of chosen) {
      try {
        new Notice(
          t(`${update.name} を更新しています…`, `Updating ${update.name}…`)
        );
        await installUpdate(this.app, update, this.token);
        ok += 1;
      } catch (err) {
        if (err instanceof RateLimitError) {
          failed.push(t("GitHub の回数制限に達しました", "GitHub rate limit reached"));
          break;
        }
        failed.push(
          `${update.name}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }
    this.busy = false;
    this.close();
    if (ok) {
      new Notice(
        t(`${ok} 件を更新しました`, `Updated ${ok} plugin(s)`)
      );
    }
    if (failed.length) {
      new Notice(failed.join("\n"), 8000);
    }
    this.onDone();
  }
}
