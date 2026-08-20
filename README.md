# K-Tech Plugin Guard

[![GitHub release](https://img.shields.io/github/v/release/crossbeat461-a11y/k-tech-plugin-guard?style=for-the-badge&display_name=tag)](https://github.com/crossbeat461-a11y/k-tech-plugin-guard/releases/latest)
[![License: MIT](https://img.shields.io/github/license/crossbeat461-a11y/k-tech-plugin-guard?style=for-the-badge)](LICENSE)
[![Release](https://img.shields.io/github/actions/workflow/status/crossbeat461-a11y/k-tech-plugin-guard/release.yml?style=for-the-badge&label=Release)](https://github.com/crossbeat461-a11y/k-tech-plugin-guard/actions/workflows/release.yml)
![App 1.5.0+](https://img.shields.io/badge/App-1.5.0%2B-483699?style=for-the-badge)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/k_tech_studio)

**[English](#readme-en)** · **[日本語](#readme-ja)**

K-Tech Studio plugin that **checks community plugin updates when you ask**, then lets you **select which ones to install**.

---

<a id="readme-en"></a>

## English

### What it does

- Ribbon, status bar, or command: **Check for plugin updates**
- Talks to GitHub at that moment (not a third-party server)
- If nothing is new: a dialog says there are no updates
- If there are updates: shows the count, checkboxes, Select all, then installs only what you chose
- Installs GitHub Release files (`main.js`, `manifest.json`, `styles.css`) — the same artifacts the official updater uses
- Optional wait-after-release, hide betas, skip disabled plugins
- Lazy Loader: read its settings so delayed plugins are not treated as disabled (other wait strategies are in Settings)

### What it does not do

- It does not send your installed plugin list to K-Tech
- It does not auto-update in the background unless you turn on “Check on startup”
- Plugins that are not in the community directory (sideloaded / BRAT-only) are skipped

### How to use

1. Enable **K-Tech Plugin Guard**
2. Click the shield in the ribbon, the status bar item, or run **Check for plugin updates**
3. If updates exist, tick the plugins you want (or Select all) and update
4. If GitHub rate-limits you (~60 requests/hour without a token), add a personal token in Settings — stored locally only

### Support

[Buy Me a Coffee](https://buymeacoffee.com/k_tech_studio)

A thank-you dialog appears once on install and once after each plugin update.

### Disclaimer (no warranty)

This software is provided **as is**, without warranty of any kind. Use at your own risk. See the [MIT License](LICENSE).

### License

MIT

---

<a id="readme-ja"></a>

## 日本語

### できること

- リボン・ステータスバー・コマンドから **プラグインの更新を確認**
- 確認の瞬間に GitHub を見に行く（第三者サーバーには送りません）
- 更新がなければ「今のところ更新はありません」
- あれば件数とチェック（すべて選択可）。選んだものだけ入れます
- 入れるファイルは GitHub Release の `main.js` / `manifest.json` / `styles.css`（本体の更新と同じ系統）
- 公開からの待機日数、ベータ非表示、無効プラグイン除外
- Lazy Loader 利用時は、そちらの設定を読んで遅延読み込みを無効と誤らない（他の待ち方も設定にあります）

### しないこと

- 導入プラグイン一覧を K-Tech に送らない
- 「起動時に確認する」をオンにしない限り、裏で自動更新しない
- コミュニティ未登録（手動コピー / BRAT のみ）は対象外

### 使い方

1. **K-Tech Plugin Guard** を有効化
2. リボンの盾、ステータスバー、またはコマンド **プラグインの更新を確認**
3. 更新があればチェックして更新
4. GitHub の回数制限（未認証はおおよそ60回/時）に当たったら、設定に PAT を。ローカル保存のみです

### 支援

[Buy Me a Coffee](https://buymeacoffee.com/k_tech_studio)

案内は **インストール時** と **このプラグイン自身の更新時** に1回ずつ出ます。

### 免責

本ソフトウェアは無保証です。自己責任でご利用ください。[MIT License](LICENSE) を参照してください。

### ライセンス

MIT
