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
        ? t("インストールありがとうございます", "Thanks for installing!")
        : t(`v${this.version} に更新しました`, `Updated to ${this.version}`);
    contentEl.createEl("h3", { text: heading });

    contentEl.createEl("p", {
      text:
        this.kind === "install"
          ? t(
              "コミュニティプラグインの更新を、選んでから入れられます。役に立ったら開発の励みにしてください（任意）。",
              "Check community plugin updates, then install only what you select. If this helps, consider supporting development (optional)."
            )
          : t(
              "新しい版に更新されました。役に立ったら、開発の励みにしてください（任意）。",
              "Thanks for updating. If this plugin helps your workflow, consider supporting development (optional)."
            ),
    });

    const actions = contentEl.createDiv({ cls: "modal-button-container" });
    const coffeeBtn = actions.createEl("button", {
      cls: "mod-cta",
      text: t("☕ Buy Me a Coffee", "☕ Buy Me a Coffee"),
    });
    coffeeBtn.addEventListener("click", () => {
      window.open(FUNDING_URL, "_blank");
      this.close();
    });

    const laterBtn = actions.createEl("button", {
      text: t("あとで", "Maybe later"),
    });
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
