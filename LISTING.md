# Listing copy (for community.obsidian.md → Edit listing)

Paste these values in the developer dashboard.

## Important (automated review)

- **`manifest.json` → `description` must NOT contain the word `Obsidian`.**
- **`authorUrl`** must be a GitHub **profile** URL, not the plugin repository.
- **`fundingUrl`** is set to Buy Me a Coffee.
- **GitHub Release title** must include the version (e.g. `K-Tech Plugin Guard 0.1.0`). CI sets this on tag push.

## Short description

```
Check community plugin updates on demand, then install only the ones you select.
```

## Longer description (if available)

```
K-Tech Plugin Guard checks your installed community plugins when you click Check. It talks to GitHub from your app (no third-party update server). If nothing is new, you get a clear “no updates” dialog. If there are updates, you see the count, tick the plugins you want (or Select all), and install GitHub Release files — the same main.js / manifest.json / styles.css the official updater uses.

Settings: skip disabled plugins, hide betas, wait N days after a release, optional GitHub token stored locally, and Lazy Loader handling so delayed plugins are not mistaken for disabled.

Support development via Buy Me a Coffee (shown on install and after this plugin updates).
```

## Suggested categories / tags

- Utility
- Updates
- Buy Me a Coffee
