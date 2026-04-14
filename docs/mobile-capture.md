# Mobile capture: phone → inbox workflow

Obsidian works on iOS and Android, and Exocortex works with it — but the starter-kit doesn't mention this anywhere, so new users assume it's desktop-only. This page fixes that and shows the exact capture flow that keeps your mobile thoughts from disappearing into a rival notes app.

> Source: written to close [issue #37](https://github.com/kitelev/exocortex-starter-kit/issues/37). Reported by a real user who asked "Как вносить заметки с телефона?" on hour 3 of his first Exocortex session (vault asset `37a88fda-74f3-4b26-bc93-8ebdac701c70`, 2026-04-12).

## 1. Install Obsidian on your phone

- **iOS**: [Obsidian on the App Store](https://apps.apple.com/app/obsidian-connected-notes/id1557175442)
- **Android**: [Obsidian on Google Play](https://play.google.com/store/apps/details?id=md.obsidian)

Both are free. Install, open, and skip the welcome flow — you'll point it at your existing vault in step 2.

## 2. Sync prerequisite

Mobile Obsidian is not magic — it needs to see the same vault your desktop sees. Pick a sync strategy **first**, then come back here.

- **Obsidian Sync** is the path of least resistance — install, sign in, open the vault. Done.
- **iCloud Drive** works for iOS-only households if you're already all-Apple.
- **Git + [obsidian-git](https://github.com/denolehov/obsidian-git)** works on mobile but is fragile; only pick this if you already live in terminals.
- **Dropbox / Google Drive** do **not** officially work with Obsidian mobile. Skip.

See the [sync setup section in the README](../README.md#before-you-start-where-does-this-live) for the full decision matrix.

## 3. Fleeting-note workflow (the happy path)

The trick: mobile capture should be **one tap away and zero-decision**. You're at a bus stop, you have a thought, you want it saved in the inbox before the bus comes. You can triage it tonight at the desk.

### iOS: home-screen Shortcut

1. Open **Shortcuts** app → `+` → `Add Action` → search for "Obsidian"
2. Pick `Obsidian → Append to note` (or `Create note` if you prefer new files)
3. Configure:
   - **Vault**: your Exocortex vault
   - **File**: `01 Inbox/fleeting-{today}.md` (Shortcuts has a Date variable)
   - **Content**: ask for text input, then append
4. `Share` the shortcut → **Add to Home Screen** → rename to `📥 Inbox`

Tap → type → done. No folder navigation, no file naming, no class picker.

### Android: Obsidian widget

1. Long-press home screen → Widgets → Obsidian
2. Pick **Create new note** widget
3. Configure it to drop files in `01 Inbox/` with a template (see [template](#fleeting-note-template) below)
4. Drag widget to a reachable corner

Android also supports [Tasker](https://tasker.joaoapps.com/) integration if you want a voice-trigger action.

### Fleeting-note template

Put this in `01 Inbox/template-fleeting.md` and point your shortcut/widget at it:

```markdown
---
exo__Instance_class:
  - "[[ztlk__FleetingNote]]"
createdAt: "{{date}}T{{time}}"
---

```

That's the whole template. Two frontmatter lines and an empty body. The [Exocortex plugin](https://github.com/kitelev/exocortex) will render it correctly once you open it on desktop, and your end-of-day triage pass (see step 5) promotes the good ones to permanent notes.

## 4. Voice-to-text one-liner

On both iOS and Android, the system keyboard has a microphone button. Tap the capture shortcut, tap the mic, talk, hit save. A 30-second thought becomes a searchable fleeting note without typing a word.

iOS pro tip: `Settings → General → Keyboard → Enable Dictation` if you haven't. Dictation works offline on recent devices.

## 5. End-of-day triage (desktop)

Mobile capture is worth nothing without a triage pass. Every evening (or morning — whatever you'll actually do) open `01 Inbox/` on desktop and for each fleeting note:

- **Junk?** Delete.
- **One-liner?** Move the content into an existing note, delete the fleeting one.
- **Real idea?** Promote to a permanent note (`ztlk__PermanentNote`) or a Task note — use the Exocortex command palette.

Three minutes a day keeps the inbox to zero. More than that means you're capturing too liberally — tighten step 3.

## Screenshots (TODO)

> **Status**: text-only for now. Real screenshots of the iOS Shortcut and Android widget are a follow-up — see issue #44. Placeholders below will be replaced in a patch release.

- `![iOS home-screen Shortcut for Inbox capture](TODO)`
- `![Android Obsidian widget placement](TODO)`

If you land on this page and the screenshots are still missing, you can still follow the text instructions — the steps are stable across Obsidian 1.5+.
