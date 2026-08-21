# HANDOFF — K-Tech Update Guard

<!-- updated: 2026-08-21 -->

## Product

| Field | Value |
|---|---|
| ID | `k-tech-update-guard` |
| Name | K-Tech Update Guard |
| Author | K-Tech Studio |
| Repo | `crossbeat461-a11y/k-tech-update-guard` |
| LP | https://k-tech-update-guard-lp.vercel.app/ |
| Version | 0.2.0 |

## Privacy

- No K-Tech / AWS backend
- Check sends requests from the user's app to GitHub and `obsidianmd/obsidian-releases` only
- Optional GitHub PAT stays in plugin `data.json`

## Build

```bash
cd c:\Github\k-tech-update-guard
npm install
npm run build          # writes main.js
npm run dev            # watch mode
```

Deploy to Mybox (manual copy):

```
c:\Users\chuyo\Dropbox\アプリ\remotely-save\Mybox\.obsidian\plugins\k-tech-update-guard\
  main.js, manifest.json, styles.css
```

Enable in Settings → Community plugins → K-Tech Update Guard.

## Architecture

```
src/main.ts          Commands, ribbon, status bar, BMC, check entry
src/i18n.ts          10 locales
src/check.ts         Compare installed manifests vs GitHub latest (plugins + themes)
src/github.ts        requestUrl + rate limit
src/registry.ts      community-plugins.json / community-css-themes.json → repo
src/lazy.ts          Lazy Loader data.json + wait strategies
src/backup.ts        Previous files before an update
src/installer.ts     Write release files; self-update without disable; rollback
src/modals.ts        No-updates / select-and-update / release notes / rollback
src/settings.ts      Options, ignore list, backups, BMC button
src/funding.ts       Install + update BMC dialog
src/version.ts       Semver compare
```

## Local test

- [ ] Display name is K-Tech Update Guard (no "Plugin")
- [ ] Install BMC dialog appears once
- [ ] Check with no updates → dialog
- [ ] Check with updates → count, Select all, install selected
- [ ] Self-update does not disable the running instance; app reloads after
- [ ] Ignore an item from the update dialog; it is gone on the next check until removed in Settings
- [ ] Update keeps previous files; Restore previous files writes them back
- [ ] Release notes expand in the update dialog
- [ ] Installed community themes appear in the check when the setting is on
- [ ] UI follows the app language among the 10 locales

## Release

Tag `0.2.0` → GitHub Release with main.js / manifest.json / styles.css.

Do not include "Obsidian" in `manifest.json` description.
Do not include "Plugin" in `manifest.json` name.
Commit and push only when the user asks.
