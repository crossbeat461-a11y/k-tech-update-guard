import { App, Modal, Notice, Setting } from "obsidian";
import { PLUGIN_ID, PLUGIN_NAME } from "./constants";
import { t } from "./i18n";
import { installUpdate, isSelfUpdate, reloadObsidian } from "./installer";
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
    contentEl.createEl("h3", { text: t("noUpdatesTitle") });
    contentEl.createEl("p", { text: t("noUpdatesBody") });
    if (this.extra.length) {
      const list = contentEl.createEl("ul", { cls: "ktech-guard-notes" });
      for (const line of this.extra) {
        list.createEl("li", { text: line });
      }
    }
    const actions = contentEl.createDiv({ cls: "modal-button-container" });
    const closeBtn = actions.createEl("button", {
      cls: "mod-cta",
      text: t("close"),
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
      text: t("updatesTitle", { count: this.updates.length }),
    });
    contentEl.createEl("p", { text: t("updatesBody") });

    if (this.extra.length) {
      const notes = contentEl.createEl("ul", { cls: "ktech-guard-notes" });
      for (const line of this.extra) {
        notes.createEl("li", { text: line });
      }
    }

    new Setting(contentEl)
      .setName(t("selectAll"))
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
      const beta = update.isBeta ? t("beta") : "";
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
      text: t("updateSelected"),
    });
    updateBtn.disabled = this.busy;
    updateBtn.addEventListener("click", () => {
      void this.applySelected();
    });

    const cancelBtn = actions.createEl("button", { text: t("cancel") });
    cancelBtn.addEventListener("click", () => this.close());
  }

  private async applySelected(): Promise<void> {
    if (this.busy) return;
    const chosen = this.updates.filter((u) => this.selected.has(u.id));
    if (!chosen.length) {
      new Notice(t("noneSelected"));
      return;
    }
    chosen.sort((a, b) => {
      const aSelf = a.id === PLUGIN_ID ? 1 : 0;
      const bSelf = b.id === PLUGIN_ID ? 1 : 0;
      return aSelf - bSelf;
    });
    this.busy = true;
    this.render();
    let ok = 0;
    let selfUpdated = false;
    const failed: string[] = [];
    for (const update of chosen) {
      try {
        new Notice(t("updating", { name: update.name }));
        await installUpdate(this.app, update, this.token);
        ok += 1;
        if (isSelfUpdate(update.id)) selfUpdated = true;
      } catch (err) {
        if (err instanceof RateLimitError) {
          failed.push(t("rateLimitedShort"));
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
      new Notice(t("updatedCount", { count: ok }));
    }
    if (failed.length) {
      new Notice(failed.join("\n"), 8000);
    }
    this.onDone();
    if (selfUpdated) {
      new Notice(t("selfUpdatedReload"));
      window.setTimeout(() => reloadObsidian(this.app), 700);
    }
  }
}
