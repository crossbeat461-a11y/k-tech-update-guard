# K-Tech Update Guard

[![GitHub release](https://img.shields.io/github/v/release/crossbeat461-a11y/k-tech-update-guard?style=for-the-badge&display_name=tag)](https://github.com/crossbeat461-a11y/k-tech-update-guard/releases/latest)
[![License: MIT](https://img.shields.io/github/license/crossbeat461-a11y/k-tech-update-guard?style=for-the-badge)](LICENSE)
[![Release](https://img.shields.io/github/actions/workflow/status/crossbeat461-a11y/k-tech-update-guard/release.yml?style=for-the-badge&label=Release)](https://github.com/crossbeat461-a11y/k-tech-update-guard/actions/workflows/release.yml)
![App 1.5.0+](https://img.shields.io/badge/App-1.5.0%2B-483699?style=for-the-badge)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/k_tech_studio)

**[English](#readme-en)** · **[日本語](#readme-ja)**

K-Tech Studio tool that **checks community updates when you ask**, then lets you **select which ones to install**.

UI languages: English, Japanese, Simplified Chinese, Traditional Chinese, Korean, Spanish, German, French, Portuguese, Russian.

---

<a id="readme-en"></a>

## English

### What it does

- Ribbon, status bar, or command: **Check for updates**
- Talks to GitHub at that moment (not a third-party server)
- If nothing is new: a dialog says there are no updates
- If there are updates: shows the count, checkboxes, Select all, then installs only what you chose
- Installs GitHub Release files (`main.js`, `manifest.json`, `styles.css`) — the same artifacts the official updater uses
- Updating K-Tech Update Guard itself writes files without disabling the running instance, then reloads
- Optional wait-after-release, hide betas, skip disabled items
- Lazy Loader: read its settings so delayed items are not treated as disabled (other wait strategies are in Settings)

### What it does not do

- It does not send your installed list to K-Tech
- It does not auto-update in the background unless you turn on “Check on startup”
- Items that are not in the community directory (sideloaded / BRAT-only) are skipped

### How to use

1. Enable **K-Tech Update Guard**
2. Click the shield in the ribbon, the status bar item, or run **Check for updates**
3. If updates exist, tick what you want (or Select all) and update
4. If GitHub rate-limits you (~60 requests/hour without a token), add a personal token in Settings — stored locally only

### Support

[Buy Me a Coffee](https://buymeacoffee.com/k_tech_studio)

A thank-you dialog appears once on install and once after each update of this tool.

### Disclaimer (no warranty)

This software is provided **as is**, without warranty of any kind. Use at your own risk. See the [MIT License](LICENSE).

### License

MIT

---

<a id="readme-ja"></a>

## 日本語

### できること

- リボン・ステータスバー・コマンドから **更新を確認**
- 確認の瞬間に GitHub を見に行く（第三者サーバーには送りません）
- 更新がなければ「今のところ更新はありません」
- あれば件数とチェック（すべて選択可）。選んだものだけ入れます
- 入れるファイルは GitHub Release の `main.js` / `manifest.json` / `styles.css`（本体の更新と同じ系統）
- 自分自身を更新するときは無効化せずファイルを書いてから再読み込みします
- 公開からの待機日数、ベータ非表示、無効項目の除外
- Lazy Loader 利用時は、そちらの設定を読んで遅延読み込みを無効と誤らない（他の待ち方も設定にあります）

画面は次の10言語です。英語、日本語、簡体中国語、繁体中国語、韓国語、スペイン語、ドイツ語、フランス語、ポルトガル語、ロシア語。

### しないこと

- 導入一覧を K-Tech に送らない
- 「起動時に確認する」をオンにしない限り、裏で自動更新しない
- コミュニティ未登録（手動コピー / BRAT のみ）は対象外

### 使い方

1. **K-Tech Update Guard** を有効化
2. リボンの盾、ステータスバー、またはコマンド **更新を確認**
3. 更新があればチェックして更新
4. GitHub の回数制限（未認証はおおよそ60回/時）に当たったら、設定に PAT を。ローカル保存のみです

### 支援

[Buy Me a Coffee](https://buymeacoffee.com/k_tech_studio)

案内は **インストール時** と **このツール自身の更新時** に1回ずつ出ます。

### 免責

本ソフトウェアは無保証です。自己責任でご利用ください。[MIT License](LICENSE) を参照してください。

### ライセンス

MIT
