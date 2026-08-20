# HANDOFF — K-Tech Plugin Guard

<!-- updated: 2026-08-21 -->

## Product

| Field | Value |
|---|---|
| ID | `k-tech-plugin-guard` |
| Name | K-Tech Plugin Guard |
| Author | K-Tech Studio |
| Repo | `crossbeat461-a11y/k-tech-plugin-guard` |
| Version | 0.1.0 |

## Privacy

- No K-Tech / AWS backend
- Check sends requests from the user's app to GitHub and `obsidianmd/obsidian-releases` only
- Optional GitHub PAT stays in plugin `data.json`

## Build

```bash
cd c:\Github\k-tech-plugin-guard
npm install
npm run build          # writes main.js
npm run dev            # watch mode
```

Deploy to Mybox (manual copy):

```
c:\Users\chuyo\Dropbox\アプリ\remotely-save\Mybox\.obsidian\plugins\k-tech-plugin-guard\
  main.js, manifest.json, styles.css
```

Enable in Settings → Community plugins → K-Tech Plugin Guard.

## Architecture

```
src/main.ts          Commands, ribbon, status bar, BMC, check entry
src/check.ts         Compare installed manifests vs GitHub latest
src/github.ts        requestUrl + rate limit
src/registry.ts      community-plugins.json → id/repo
src/lazy.ts          Lazy Loader data.json + wait strategies
src/installer.ts     Write release files, reload plugin
src/modals.ts        No-updates / select-and-update
src/settings.ts      Options + BMC button
src/funding.ts       Install + update BMC dialog
src/version.ts       Semver compare
```

## Local test (before first push)

Do not push until the user confirms in Obsidian.

Checklist:

- [ ] Install BMC dialog appears once
- [ ] Check with no updates → 今のところ更新はありません
- [ ] Check with updates → count, Select all, individual toggles, install selected
- [ ] Disabled plugins skipped when setting is on
- [ ] Lazy strategy "Read Lazy Loader settings" does not treat delayed plugins as disabled
- [ ] Settings BMC button opens buymeacoffee.com/k_tech_studio

## Release

Same as TableCSV / Heading Jump Fix: tag `0.1.0` → `.github/workflows/release.yml`.

Do not include "Obsidian" in `manifest.json` description.
Commit and push only when the user asks.
