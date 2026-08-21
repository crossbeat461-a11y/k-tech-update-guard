import { App, Component, MarkdownRenderer, Modal, Notice, Setting } from "obsidian";
import { listBackups } from "./backup";
import { PLUGIN_ID, PLUGIN_NAME } from "./constants";
import { fetchLatestRelease, githubReleasePageUrl, RateLimitError } from "./github";
import { t } from "./i18n";
import {
  installUpdate,
  isSelfUpdate,
  reloadObsidian,
  rollbackUpdate,
} from "./installer";
import type { AvailableUpdate, BackupRecord } from "./types";

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
  private expanded = new Set<string>();
  private busy = false;
  private loadingNotes = new Set<string>();

  constructor(
    app: App,
    private updates: AvailableUpdate[],
    private readonly token: string,
    private readonly extra: string[],
    private readonly onIgnore: (update: AvailableUpdate) => Promise<void>,
    private readonly onDone: () => void
  ) {
    super(app);
    for (const update of updates) {
      this.selected.add(update.key);
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

    new Setting(contentEl).setName(t("selectAll")).addToggle((toggle) => {
      toggle.setValue(
        this.updates.length > 0 && this.selected.size === this.updates.length
      );
      toggle.onChange((on) => {
        this.selected.clear();
        if (on) {
          for (const update of this.updates) this.selected.add(update.key);
        }
        this.render();
      });
    });

    for (const update of this.updates) {
      this.renderItem(contentEl, update);
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

  private renderItem(parent: HTMLElement, update: AvailableUpdate): void {
    const wrap = parent.createDiv({ cls: "ktech-guard-item" });
    const kindLabel = update.kind === "theme" ? t("kindTheme") : t("kindPlugin");
    const beta = update.isBeta ? t("beta") : "";
    const row = new Setting(wrap);
    row.setName(update.name);
    row.setDesc(`${kindLabel} · ${update.currentVersion} → ${update.latestVersion}${beta}`);
    row.addToggle((toggle) => {
      toggle.setValue(this.selected.has(update.key));
      toggle.onChange((on) => {
        if (on) this.selected.add(update.key);
        else this.selected.delete(update.key);
      });
    });

    const notesWrap = wrap.createDiv({ cls: "ktech-guard-release" });
    const open = this.expanded.has(update.key);
    const toggleBtn = notesWrap.createEl("button", {
      cls: "ktech-guard-link",
      text: t("releaseNotes"),
    });
    toggleBtn.addEventListener("click", () => {
      if (this.expanded.has(update.key)) this.expanded.delete(update.key);
      else this.expanded.add(update.key);
      this.render();
    });

    const githubBtn = notesWrap.createEl("a", {
      cls: "ktech-guard-link",
      text: t("openRelease"),
      href: githubReleasePageUrl(update.repo, update.tagName),
    });
    githubBtn.setAttr("target", "_blank");
    githubBtn.setAttr("rel", "noopener noreferrer");

    const ignoreBtn = notesWrap.createEl("button", {
      cls: "ktech-guard-link",
      text: t("ignoreItem"),
    });
    ignoreBtn.disabled = this.busy;
    ignoreBtn.addEventListener("click", () => {
      void this.ignoreItem(update);
    });

    if (!open) return;

    const body = notesWrap.createDiv({ cls: "ktech-guard-release-notes" });
    if (update.notes.trim()) {
      void MarkdownRenderer.render(
        this.app,
        update.notes,
        body,
        "",
        this as unknown as Component
      );
      return;
    }
    if (this.loadingNotes.has(update.key)) {
      body.createEl("p", { text: t("statusChecking") });
      return;
    }
    const empty = body.createEl("p", { text: t("releaseNotesEmpty") });
    empty.addClass("ktech-guard-muted");
    const loadBtn = body.createEl("button", {
      cls: "mod-cta",
      text: t("loadNotes"),
    });
    loadBtn.addEventListener("click", () => {
      void this.loadNotes(update);
    });
  }

  private async loadNotes(update: AvailableUpdate): Promise<void> {
    if (this.loadingNotes.has(update.key)) return;
    this.loadingNotes.add(update.key);
    this.render();
    try {
      const release = await fetchLatestRelease(update.repo, this.token);
      if (release) {
        update.notes = release.notes || "";
        update.tagName = release.tagName || update.tagName;
        update.publishedAt = release.publishedAt || update.publishedAt;
        update.isBeta = update.isBeta || release.prerelease;
        if (release.assets.length) update.assets = release.assets;
      }
    } catch (err) {
      if (err instanceof RateLimitError) {
        new Notice(t("rateLimitedShort"));
      } else {
        new Notice(err instanceof Error ? err.message : String(err));
      }
    } finally {
      this.loadingNotes.delete(update.key);
      this.expanded.add(update.key);
      this.render();
    }
  }

  private async ignoreItem(update: AvailableUpdate): Promise<void> {
    await this.onIgnore(update);
    this.updates = this.updates.filter((item) => item.key !== update.key);
    this.selected.delete(update.key);
    this.expanded.delete(update.key);
    new Notice(t("ignoredNotice", { name: update.name }));
    if (!this.updates.length) {
      this.close();
      this.onDone();
      return;
    }
    this.render();
  }

  private async applySelected(): Promise<void> {
    if (this.busy) return;
    const chosen = this.updates.filter((u) => this.selected.has(u.key));
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
        if (isSelfUpdate(update.id, update.kind)) selfUpdated = true;
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

export class RollbackModal extends Modal {
  private busy = false;
  private backups: BackupRecord[] = [];

  constructor(
    app: App,
    private readonly onRestored: (id: string, kind: BackupRecord["kind"]) => void
  ) {
    super(app);
  }

  onOpen(): void {
    void this.reload();
  }

  onClose(): void {
    this.contentEl.empty();
  }

  private async reload(): Promise<void> {
    this.backups = await listBackups(this.app);
    this.render();
  }

  private render(): void {
    const { contentEl, titleEl } = this;
    contentEl.empty();
    titleEl.setText(PLUGIN_NAME);
    contentEl.createEl("h3", { text: t("rollbackHeading") });
    contentEl.createEl("p", { text: t("rollbackDesc") });

    if (!this.backups.length) {
      contentEl.createEl("p", { text: t("rollbackEmpty"), cls: "ktech-guard-muted" });
    } else {
      for (const backup of this.backups) {
        const kindLabel = backup.kind === "theme" ? t("kindTheme") : t("kindPlugin");
        const row = new Setting(contentEl);
        row.setName(backup.name);
        row.setDesc(
          `${kindLabel} · ${backup.toVersion} → ${backup.fromVersion}`
        );
        row.addButton((button) => {
          button.setButtonText(t("rollbackButton"));
          button.setDisabled(this.busy);
          button.onClick(() => {
            void this.restore(backup);
          });
        });
      }
    }

    const actions = contentEl.createDiv({ cls: "modal-button-container" });
    const closeBtn = actions.createEl("button", {
      cls: "mod-cta",
      text: t("close"),
    });
    closeBtn.addEventListener("click", () => this.close());
  }

  private async restore(backup: BackupRecord): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    this.render();
    try {
      const restored = await rollbackUpdate(this.app, backup.key);
      new Notice(t("rolledBack", { name: restored.name }));
      this.onRestored(restored.id, restored.kind);
      if (isSelfUpdate(restored.id, restored.kind)) {
        new Notice(t("selfUpdatedReload"));
        window.setTimeout(() => reloadObsidian(this.app), 700);
      }
      await this.reload();
    } catch (err) {
      new Notice(
        t("rollbackFailed", {
          name: backup.name,
          error: err instanceof Error ? err.message : String(err),
        }),
        8000
      );
    } finally {
      this.busy = false;
      if (this.containerEl.isConnected) this.render();
    }
  }
}
