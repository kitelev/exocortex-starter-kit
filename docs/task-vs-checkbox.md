# Task-note vs Checkbox: when to use which

One of the first things new users re-invent on their own: *"do I need a full Task note, or is a checkbox inside the project note enough?"* This page answers that in under five minutes.

> Source: written to close [issue #34](https://github.com/kitelev/exocortex-starter-kit/issues/34), based on 1.5 hours of first-hour confusion recorded by a real user on 2026-04-12 (vault asset `37a88fda-74f3-4b26-bc93-8ebdac701c70`).

> **New to Exocortex?** Read [The first 90 minutes](first-90-minutes.md) first — it walks you through the Area → Project → Task hierarchy in order and hits this same checkbox moment around minute 35. This page is the reference you come back to, not the introduction.

> **Task spans multiple Areas or streams?** See [Multi-area task pattern](patterns/multi-area-task.md) for the canonical `ems__Effort_area` array shape.

## TL;DR

Use a **checkbox** inside the project note when the task is small, local to one project, and you don't care about its history. Use a **Task note** the moment you need the task to appear in the graph, span multiple areas, or carry its own metadata.

## Decision tree

Ask these four questions top-down. Stop at the first **Yes**.

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Does the task touch 2+ projects, streams, or areas?      │
│    Yes → Task note (you need graph edges to all of them)    │
│    No  → go to 2                                            │
├─────────────────────────────────────────────────────────────┤
│ 2. Do you need a status history (Draft → Doing → Done)?     │
│    Yes → Task note (checkbox is only toggle on/off)         │
│    No  → go to 3                                            │
├─────────────────────────────────────────────────────────────┤
│ 3. Will you attach comments, files, or custom properties?   │
│    Yes → Task note (checkbox is a single line of text)      │
│    No  → go to 4                                            │
├─────────────────────────────────────────────────────────────┤
│ 4. Is it smaller than ~15 minutes of actual work?           │
│    Yes → Checkbox (not worth a file)                        │
│    No  → Task note (default for meaningful work)            │
└─────────────────────────────────────────────────────────────┘
```

If you answered **No** to 1-3 and **Yes** to 4 — stay with the checkbox. Everything else earns a Task note.

## Worked example: project "Philippines"

You're planning a two-week trip. You create a project note `Philippines.md` with four things to do. Here's how each one lands:

| Task | Why | Where |
|---|---|---|
| Book flight tickets | Touches `Finance` stream + `Philippines` project | **Task note** linked to both |
| Meet Danya for steaks | Touches `People/Danya` + `Philippines` | **Task note** linked to both |
| Print boarding pass day-of | Single project, 5 min, no history needed | **Checkbox** in `Philippines.md` |
| Pack sunscreen | Trivial, one project | **Checkbox** in `Philippines.md` |

The two Task notes become nodes in the graph and can be queried from `People/Danya` ("what do I owe Danya?") or `Finance` ("what trip-spend is pending?"). The two checkboxes stay as plain text inside `Philippines.md` — you check them off on departure day and never think about them again.

```
      ┌──────────────┐
      │ Philippines  │
      └──────┬───────┘
       ┌─────┼─────────────┬───────────┐
       │     │             │           │
       ▼     ▼             ▼           ▼
    [x] Print   [x] Pack   Flight     Steaks
     boarding    sunscreen tickets    with Danya
      (inside Philippines.md)   │         │
                                ▼         ▼
                            Finance   People/Danya
```

The graph only shows the two Task notes. That's the point: the graph stays readable because trivial checkboxes don't pollute it.

## Anti-pattern: "everything is a Task note"

The opposite failure mode: a user promotes **every** TODO to a Task note, including "reply to Slack DM" and "refill coffee beans". Within a week the graph becomes an unreadable hairball and the user gives up on Exocortex.

**This is not a reason to avoid Task notes.** Readability is solved by *views*, not by removing links:

- Use a **Dataview** query to list only `Task` notes in `Doing` status for the current week — instead of staring at the raw graph.
- Use the **Graph View filter** `path:Projects/ -path:Inbox/` to hide fleeting notes.
- Pin a **saved search** per area so each context shows only its own tasks.

The rule is: **link generously, filter aggressively**. Don't skimp on Task notes just to keep the graph "clean" — you'll lose the exact edges that make the graph valuable in the first place.

## Five-minute self-test

You read this doc. Now pick three tasks from your current day and decide for each: Task note or checkbox? If you can decide in under 60 seconds per task without re-reading — this page did its job. If not, [open an issue](https://github.com/kitelev/exocortex-starter-kit/issues) and tell us where the tree was ambiguous.
