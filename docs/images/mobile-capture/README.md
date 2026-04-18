# Mobile capture screenshots

This directory holds reference screenshots used by [`docs/mobile-capture.md`](../../mobile-capture.md). Replace this file (and any existing placeholder PNGs) with real captures as described below.

## Expected files

| Filename | Source | Required | What it shows |
|----------|--------|----------|---------------|
| `01-ios-shortcut-home.png` | iPhone | yes | Shortcuts app → home screen, just after tapping `+` to create a new shortcut. |
| `02-ios-shortcut-body.png` | iPhone | yes | The shortcut body with `Obsidian → Append to note` configured against `01 Inbox/fleeting-{today}.md`. |
| `03-android-widget-home.png` | Android | optional | Long-press on the home screen with the Obsidian widget picker open. Skip if no Android device is available — document the skip in the PR. |
| `04-android-widget-configured.png` | Android | optional | Obsidian "Create new note" widget configured to drop into `01 Inbox/`. Skip if no Android device is available. |

## Capture guidelines

- Use the device's native screenshot (no editing / markup).
- Prefer light mode so screenshots stay legible on GitHub's default theme.
- Strip any personal info (names, emails, tokens) before committing.
- PNG only. Keep each file under ~500 KB — re-export with a system tool if needed.

## How to commit

1. Drop the PNGs into this directory using their exact filenames above.
2. Remove this `README.md` **only if** all four images are committed and the doc renders correctly — otherwise keep it so contributors know what's still missing.
3. Push to the open PR for [issue #44](https://github.com/kitelev/exocortex-starter-kit/issues/44); the PR checklist tracks which captures have landed.
