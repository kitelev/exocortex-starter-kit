# Task reminders — from planned timestamp to desktop notification

> **Who this is for:** you set `ems__Effort_plannedStartTimestamp` on a Task, then wait, then nothing happens. You expected a desktop notification — obviously.

Exocortex captures *when* work is planned, but the plugin itself doesn't fire OS notifications. This guide wires Obsidian's [Reminder plugin](https://github.com/uphy/obsidian-reminder) to your Exocortex Tasks so you get a desktop ping when the time comes.

This is **Phase 1** of issue [#2803](https://github.com/kitelev/exocortex/issues/2803): pure docs + an off-the-shelf community plugin, no Exocortex code changes. Phase 2 (native `NotificationService` inside the plugin) is tracked on the same issue and will ship only if this setup proves insufficient.

## TL;DR

1. Install **Reminder** by @uphy from Community Plugins.
2. Turn on the setting "Remind intervals for reminders" and set your lead time (default: on-time).
3. Add a Reminder line inside the Task note's body (not frontmatter) — see [Wiring](#wiring-plannedStartTimestamp-to-a-reminder) below.
4. Keep Obsidian running — the plugin can only notify while the app is open.

## Why not frontmatter alone?

Reminder plugin's scheduling engine reads **inline markers inside task list items**, not arbitrary frontmatter keys. It doesn't know what `ems__Effort_plannedStartTimestamp` is, and there's no config option to teach it. That's the honest limitation — the two most natural mappings (read-from-frontmatter or custom-field-name) are simply not supported as of the plugin's current release.

So the wiring is: keep `ems__Effort_plannedStartTimestamp` as your single source of truth, and additionally paste one Reminder-formatted line into the Task body when you want a notification. It's one extra line per reminder-enabled Task, not a migration.

## Install Reminder plugin

1. Open **Settings → Community plugins → Browse**.
2. Search for `Reminder` (author: `uphy`).
3. Click **Install**, then **Enable**.
4. Back in Settings, open the **Reminder** tab. The defaults are fine for first use; the only knob worth touching is **Remind intervals** (how long before the timestamp you want the ping).

## Wiring plannedStartTimestamp to a reminder

Open a Task note and add a single task-item line anywhere in the body:

```markdown
- [ ] ⏰ (reminder) @2026-04-14 09:30
```

Format cheatsheet:

| Syntax                       | Meaning                                                   |
| ---------------------------- | --------------------------------------------------------- |
| `@YYYY-MM-DD HH:MM`          | Native Reminder format                                    |
| `📅 YYYY-MM-DD`               | Obsidian Tasks plugin compatibility                       |
| `@{YYYY-MM-DD}`              | Obsidian Kanban plugin compatibility                      |

Use the same date/time you put into `ems__Effort_plannedStartTimestamp`. Yes, it's duplicated — Phase 2 will collapse them once a native notifier lands.

If you find yourself doing this often, create an Obsidian [template](https://help.obsidian.md/Plugins/Templates) for new Tasks that already contains the `- [ ] ⏰ (reminder) @` line, and fill in the date when you set the planned timestamp.

## Limitations you should know

- **Obsidian must be running.** Desktop notifications fire from the plugin process; close Obsidian and the reminder never shows. Pin the app to your launcher or set it to start on login.
- **No mobile notifications.** The plugin's FAQ is explicit: Obsidian doesn't expose system-notification APIs on iOS or Android. Mobile users see the reminder only when they open the Reminder panel inside the app. For true push-to-phone, wait for Phase 2 or use a companion tool like a Shortcuts automation that reads the timestamp from your Sync'd vault.
- **Frontmatter is not auto-parsed.** As noted above, Reminder doesn't read `ems__Effort_plannedStartTimestamp` directly. The inline line is mandatory.
- **Completed tasks still fire.** Reminder doesn't check `ems__Effort_status`. If a Task is marked Done before the timestamp, check the Reminder checkbox (`- [x]`) too so the notification doesn't fire.

## Phase 2 roadmap

If this workflow is painful enough — especially the duplication and the "must-be-running" constraint — the next step is a native Exocortex notifier:

- Scan the vault every 60s for `ems__Task` notes with `_plannedStartTimestamp` within ±5 min of `now()` AND `_status` ≠ `Done`.
- Emit via `ObsidianNotificationService` (already in the plugin) and optionally the Electron-level `Notification` API for OS-native pings.
- Config: on/off, lead time, per-class enable.

Track it on [#2803](https://github.com/kitelev/exocortex/issues/2803). Report friction in the issue — "Phase 1 is enough" keeps Exocortex small; "Phase 1 is not enough" gets Phase 2 prioritized.

---

**Source of this guide:** Exocortex vault asset `37a88fda-74f3-4b26-bc93-8ebdac701c70` — Ваня Холькин, 2026-04-12 11:04: «Хочу напоминалки по задачам».
