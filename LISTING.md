# Listing copy (for community.obsidian.md → Edit listing)

Paste these values in the developer dashboard.

## Important (automated review)

- **`manifest.json` → `name` must NOT contain the word `Plugin`.**
- **`manifest.json` → `description` must NOT contain the word `Obsidian`.**
- **`authorUrl`** must be a GitHub **profile** URL, not the repository.
- **`fundingUrl`** is set to Buy Me a Coffee.
- **GitHub Release title** must include the version (e.g. `K-Tech Update Guard 0.1.2`).

## Short description

```
Check community updates on demand, then install only the ones you select.
```

## Longer description (if available)

```
K-Tech Update Guard checks your installed community items when you click Check. It talks to GitHub from your app (no third-party update server). If nothing is new, you get a clear “no updates” dialog. If there are updates, you see the count, tick what you want (or Select all), and install GitHub Release files — the same main.js / manifest.json / styles.css the official updater uses.

Updating this tool itself writes the new files without disabling the running instance, then reloads. Settings: skip disabled items, hide betas, wait N days after a release, optional GitHub token stored locally, and Lazy Loader handling so delayed items are not mistaken for disabled.

The interface follows the app language among English, Japanese, Simplified Chinese, Traditional Chinese, Korean, Spanish, German, French, Portuguese, and Russian.

Support development via Buy Me a Coffee (shown on install and after this tool updates).
```

## Suggested categories / tags

- Utility
- Updates
- Buy Me a Coffee
