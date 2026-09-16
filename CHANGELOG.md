# Changelog

## 1.0.4

- Fix community review warning: typed check result and dedupe error messages without unsafe calls

### 日本語

- コミュニティ審査の Warning（型安全でない呼び出し）を修正。確認結果の型を明示し、エラーメッセージの重複除去を安全にした

## 1.0.3

- Check newer versions from Release `manifest.json` first. GitHub API is used for wait-days and when you open release notes
- Show remaining GitHub API calls after a check
- Skip BRAT-managed items by default (can turn off in Settings)
- Settings state that sideloaded / directory-missing items are out of scope
- Shorter GitHub token help (public-repo read is enough)

### 日本語

- 確認はまず Release の `manifest.json`。GitHub API は「公開から待つ」日数があるときと、リリースノートを開いたときに使う
- 確認後に GitHub API の残り回数を出す
- BRAT が管理する項目は既定で対象外（設定でオフにできる）
- コミュニティ未掲載は対象外であることを設定に書く
- トークンの説明を短くした（公開リポジトリの読み取りで足りる）

## 1.0.2

- Japanese install and update support text: 「サポートお願いします。開発の励みになります。」

### 日本語

- インストール／更新後の案内を「サポートお願いします。開発の励みになります。」に変更

## 1.0.1

- Settings: the ignore list no longer calls the 1.13.0-only `SettingTab.update()`, which was newer than the declared `minAppVersion` (1.8.7). It now re-renders itself, like the rollback list.

### 日本語

- 設定の無視リストが、宣言した `minAppVersion`（1.8.7）より新しい `SettingTab.update()` を呼んでいた点を修正。ロールバック一覧と同じ方式で自分で再描画するようにした

## 1.0.0

- Community review warnings: use `getLanguage()`, typed `mapPool` buffer, typed settings merge, and `getSettingDefinitions()` for settings search
- `minAppVersion` is 1.8.7 (`getLanguage`)
- First stable release

### 日本語

- コミュニティ審査の警告に対応：`getLanguage()`、型付きの `mapPool` バッファ、型付きの設定マージ、設定検索向けの `getSettingDefinitions()`
- `minAppVersion` は 1.8.7（`getLanguage`）
- 最初の安定版

## 0.2.0

- Ignore list: skip an item on future checks, and remove it again in Settings
- Rollback: keep the previous files and restore them from Settings or the command
- Release notes in the update dialog, with a GitHub link
- Check installed community themes (`theme.css` from GitHub Releases)

### 日本語

- 無視リスト：今後の確認から外し、設定から解除できる
- ロールバック：更新前のファイルを残し、設定またはコマンドで戻せる
- 更新ダイアログでリリースノートを表示（GitHub へのリンク付き）
- 導入済みコミュニティテーマも確認（GitHub Release の `theme.css`）

## 0.1.3

- Treat GitHub release notes that say beta, alpha, or rc as beta (Hide betas)
- After install, read the written manifest so the same update is not offered again
- Check latest `manifest.json` from GitHub Releases first, to avoid burning the shared API limit
- Download release files without GitHub API Accept headers

### 日本語

- リリースノートの beta / alpha / rc も「ベータ版を出さない」の対象にする
- インストール後に書いた `manifest.json` を読み、同じ更新を出し直さない
- 確認はまず Release の `manifest.json` を見る（GitHub API の回数を節約）
- 配布ファイルの取得で GitHub API 用の Accept を付けない

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
