import { App, Modal } from "obsidian";
import { FUNDING_URL, PLUGIN_NAME } from "./constants";
import { t } from "./i18n";

export class FundingModal extends Modal {
  constructor(
    app: App,
    private readonly kind: "install" | "update",
    private readonly version: string
  ) {
    super(app);
  }

  onOpen(): void {
    const { contentEl, titleEl } = this;
    titleEl.setText(PLUGIN_NAME);

    const heading =
      this.kind === "install"
        ? t("thanksInstall")
        : t("updatedTo", { version: this.version });
    contentEl.createEl("h3", { text: heading });

    contentEl.createEl("p", {
      text:
        this.kind === "install" ? t("thanksInstallBody") : t("thanksUpdateBody"),
    });

    const actions = contentEl.createDiv({ cls: "modal-button-container" });
    const coffeeBtn = actions.createEl("button", {
      cls: "mod-cta",
      text: "☕ " + t("bmc"),
    });
    coffeeBtn.addEventListener("click", () => {
      window.open(FUNDING_URL, "_blank");
      this.close();
    });

    const laterBtn = actions.createEl("button", { text: t("later") });
    laterBtn.addEventListener("click", () => this.close());
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

export function openFundingModal(
  app: App,
  kind: "install" | "update",
  version: string
): void {
  new FundingModal(app, kind, version).open();
}
