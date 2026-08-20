# Changelog

## 0.1.2

- Settings heading uses `Setting.setHeading()`
- Settings reads are typed so they are not flagged as the 1.13 `Plugin.settings` API

### 日本語

- 設定の見出しを `Setting.setHeading()` に変更
- 設定値の参照が 1.13 の `Plugin.settings` と誤判定されないように型を分離

## 0.1.1

- Rename display name to **K-Tech Update Guard** (directory does not allow "Plugin" in the name)
- ID and repository: `k-tech-update-guard`
- UI in 10 languages (Obsidian language, else English)
- Self-update writes files without disabling the running instance, then reloads
- Own GitHub repo is used even before the community directory lists this ID

### 日本語

- 表示名を **K-Tech Update Guard** に変更（ディレクトリは名前に Plugin を禁止）
- ID とリポジトリを `k-tech-update-guard` に
- 画面は10言語（Obsidian の言語。未対応は英語）
- 自分自身の更新は無効化せずファイルを書いてから再読み込み
- コミュニティ未掲載でも自分の GitHub リポジトリを確認

## 0.1.0

- Check community updates on demand (ribbon, status bar, command)
- Show a dialog when nothing is new
- Select individual items or all, then install from GitHub Releases
- Optional GitHub token, wait-after-release, hide betas, skip disabled items
- Lazy Loader: configurable handling so delayed items are not treated as disabled
- Buy Me a Coffee prompt on install and after this tool updates
