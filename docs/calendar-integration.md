# Calendar integration

*How to put `ems__Effort_plannedStartTimestamp` on a timeline — and the honest limitations of every option.*

> Source: written to close [issue #38](https://github.com/kitelev/exocortex-starter-kit/issues/38), prompted by real-user question at the 3-hour mark: *«Как интегрироваться с календарём?»* (vault asset `37a88fda-74f3-4b26-bc93-8ebdac701c70`, 10:52).

## TL;DR

There is no single «Exocortex calendar» plugin. You combine:

1. **Dataview** — one copy-paste query to see your planned week as a table.
2. **Day Planner** — optional, for a single-day timeline block rendered inside a daily note.
3. **Obsidian Calendar plugin** — optional, for a monthly grid of *daily notes* (not events).

Two-way sync with Google Calendar / iCloud is **out of scope** for the v1 starter-kit. See [Non-goals](#non-goals) below.

## Data model: which timestamp means what

Exocortex defines five timestamp fields on every `ems__Task` / `ems__Project`. Use the right one or your rollups will lie.

| Field | Meaning | Example |
|---|---|---|
| `ems__Effort_plannedStartTimestamp` | **Your plan** — «I want to start at 14:00» | `2026-04-20T14:00:00` |
| `ems__Effort_plannedEndTimestamp` | Your plan — expected end | `2026-04-20T15:00:00` |
| `ems__Effort_scheduledStartTimestamp` | **Fixed schedule** — «the meeting is at 14:00, I don't control it» | `2026-04-20T14:00:00` |
| `ems__Effort_deadlineTimestamp` | **Hard deadline** — «must be done no later than» | `2026-04-25T23:59:59` |
| `ems__Effort_startTimestamp` | **Fact** — actually started | `2026-04-20T14:03:12` |
| `ems__Effort_endTimestamp` | **Fact** — actually finished | `2026-04-20T15:47:03` |

### Rule: Fact > Plan

If `ems__Effort_startTimestamp` exists, `ems__Effort_plannedStartTimestamp` is **ignored** in rollups. The plugin's status commands (`Set Status Doing`, `Set Status Done`) write the fact timestamps automatically — you don't maintain them by hand. This rule is enforced at the query layer: any Dataview you write should prefer the fact over the plan if both exist.

See `CLAUDE.md` in the main Exocortex repo for the full «Fact > Plan» rationale.

## Option 1: Dataview — weekly view (recommended, zero extra plugins)

This is the only option that **actually reads your `ems__Effort_plannedStartTimestamp`**. Paste this into any note and open Reading Mode:

````markdown
```dataview
TABLE WITHOUT ID
  file.link as Task,
  ems__Effort_plannedStartTimestamp as "Start",
  ems__Effort_plannedEndTimestamp as "End",
  ems__Effort_status as "Status"
FROM ""
WHERE contains(exo__Instance_class, "ems__Task")
  AND ems__Effort_plannedStartTimestamp >= date(today)
  AND ems__Effort_plannedStartTimestamp < date(today) + dur(7 days)
SORT ems__Effort_plannedStartTimestamp ASC
```
````

**What you get.** A sortable table of every Task planned in the next 7 days, pulled live from your vault frontmatter. No config, no extra plugin beyond Dataview itself (which the starter-kit already requires — see [prerequisites](../README.md#prerequisites)).

**What you do NOT get.** A visual timeline, drag-to-reschedule, or recurring events. It is a list, not a gantt. For most starter-kit users this is enough — the ontology is the source of truth, and the «view» is just a rendering.

**Dogfood note.** This query is documented as a *reference* shape. If your vault uses different field names (e.g. renamed via ontology customization), adjust the field names to match. The query above assumes unchanged starter-kit ontology.

## Option 2: Day Planner — single-day timeline (optional)

[**Day Planner**](https://github.com/ivan-lednev/obsidian-day-planner) is a community plugin that renders a day as a time-blocked column inside a daily note.

**What it does well.** Draw a day as vertical blocks (`09:00-10:30 Deep work`), get a «current time» indicator, reorder by drag.

**Honest limitation.** Day Planner does **not** read `ems__Effort_plannedStartTimestamp` from your Task frontmatter. It reads its own Markdown format inside the daily note:

```markdown
## 2026-04-20
- [ ] 14:00-15:00 Review project charter [[task-review-charter]]
```

That means: to see a Task on the Day Planner timeline, you duplicate the time into the daily note. Your Task note still owns the canonical `ems__Effort_plannedStartTimestamp`; Day Planner is a *visualization layer* you maintain by hand (or by copy-paste from a Dataview query).

**Worth it when:** you plan tomorrow in time blocks and want a visual schedule. **Not worth it when:** you just want «show me my week» — use Option 1.

## Option 3: Obsidian Calendar plugin — daily note grid (not what you think)

[**Calendar**](https://github.com/liamcain/obsidian-calendar-plugin) by @liamcain is the first search hit for «Obsidian calendar plugin», so everyone tries it. Here's what it actually does:

- Draws a **monthly grid of daily notes** in the right sidebar.
- Click a day → opens that day's daily note. If the note doesn't exist, creates it from your daily note template.
- Shows dots for word count and unchecked tasks *inside that daily note file*.

**What it does NOT do.**

- It does **not** read `ems__Effort_plannedStartTimestamp` from any Task note frontmatter.
- It does **not** show scheduled events from Task metadata.
- Each cell represents one **daily note file**, not «events on that day».

If you want a date-picker UI for navigating daily notes — install it. If you want to see your planned Tasks on a monthly grid — it won't help; use Dataview (Option 1) grouped by day.

## Decision matrix

| You want | Use |
|---|---|
| «Show my planned tasks for the week» | **Dataview** (Option 1) |
| «Block out tomorrow hour-by-hour» | **Day Planner** (Option 2) |
| «Navigate between daily notes via a calendar grid» | **Obsidian Calendar plugin** (Option 3) |
| «Desktop notifications when a task is due» | [Task reminders](reminders.md) |
| «Two-way sync with Google Calendar / iCloud» | *Not supported* — see Non-goals |

## Non-goals

These are intentionally **not** part of the starter-kit integration story. If you need them, you're on your own plugin stack:

- **Two-way sync with Google Calendar / iCloud / Outlook.** Plugins exist ([obsidian-ical](https://github.com/TrimTim/obsidian-ical), [gcal](https://github.com/mdelobelle/obsidian-gcal)), but none are officially endorsed here. The concern: two-way sync turns your vault into a replica, and rollup math gets weird when events appear/disappear from network state.
- **Recurring events.** Exocortex has `ems__TaskPrototype` for recurring task templates — that's a separate pattern (weekly routines, habits) and is not a calendar feature. Documentation for prototypes ships in a later release.
- **Meeting room / resource booking.** Use a real calendar system; Obsidian is a knowledge store, not a scheduler.

## See also

- [The first 90 minutes](first-90-minutes.md) — minute 30–50 introduces `ems__Effort_plannedStartTimestamp`.
- [Task reminders](reminders.md) — the notification side of planning (reads the same `plannedStartTimestamp` field).
- [Multi-area task pattern](patterns/multi-area-task.md) — if a planned Task touches multiple Areas, model it correctly *before* adding it to the calendar view.
