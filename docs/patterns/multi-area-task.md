# Multi-area task pattern

*A task that belongs to one project but crosses several life streams — and how to model it without duplicating notes.*

> Source: written to close [issue #35](https://github.com/kitelev/exocortex-starter-kit/issues/35), based on real-user confusion from 2026-04-12 (vault asset `37a88fda-74f3-4b26-bc93-8ebdac701c70`, 09:47 → 10:10).

## Who this is for

You're using the starter-kit and you hit this moment:

> «Проект "Филиппины" — туда логически падает задача "Перевести деньги Киту". Но эта же задача имеет прямое отношение к стриму "Деньги и материальное". Как связать её со стримом, не дублируя заметку?»

And then, five minutes later, the follow-up:

> «Таких задач у меня штук десять. Я сейчас получу нечитаемую кракозябру, да?»

No. You get a **cleaner** graph than folder-based PKM — one asset, many edges, all automatic. This page shows you the canonical pattern.

## The problem

A checkbox inside a project note cannot belong to two places. You'd have to copy-paste it into the second area note, and then you have two checkboxes to tick off, two sources of truth, and zero graph edges.

A **Task note** solves this the moment you accept that `ems__Effort_area` is an array.

## Canonical pattern

```yaml
---
exo__Instance_class:
  - "[[1b20a8f0-d745-4e93-91db-4531b3df120e|ems__Task]]"
exo__Asset_label: "Перевод денег от Кита"
exo__Asset_uid: task-fpp-money-transfer
ems__Effort_parent:
  - "[[project-phillipines|Проект Филиппины]]"
ems__Effort_area:
  - "[[area-money|Деньги и материальное]]"
  - "[[area-phillipines|Филиппины]]"
exo__Asset_relates:
  - "[[area-people|Люди]]"
ems__Effort_status: "[[753a44d5-846c-4b82-9196-4fd9a4d48777|ems__EffortStatusBacklog]]"
---
```

### Three fields, three different meanings

| Field | Cardinality | Meaning |
|---|---|---|
| `ems__Effort_parent` | **One** (the single owning Project) | The task rolls up to *this* project's progress. There is exactly one parent — a task cannot have two parents, or rollup math breaks. |
| `ems__Effort_area` | **Many** (array of Area wikilinks) | The task appears in *every* listed Area's task rollup. A Task with two Areas shows up in both areas' dashboards. |
| `exo__Asset_relates` | **Many** (semantic backlinks) | «This task is *about* these things» — ad-hoc graph edges without participating in rollups. Use for weaker «also relevant to» links. |

**Rule of thumb.** If you'd expect the task to appear in an Area's «tasks» dashboard, put the Area in `ems__Effort_area`. If you only want a graph edge for context («this payment is related to the *Люди* stream because Кит is a person»), use `exo__Asset_relates`.

## What this looks like in the graph

When you open Local Graph (`Cmd+P → Graph view: Open local graph`) on the Task note, you see **one node** in the middle with edges to:

- the Project (`Проект Филиппины`) — via `ems__Effort_parent`
- both Areas (`Деньги и материальное`, `Филиппины`) — via `ems__Effort_area`
- the «Люди» stream — via `exo__Asset_relates`

Without the multi-area pattern, that same task would either live in only one of those clusters or need to be duplicated. One asset, four edges — that's the entire trick.

> **Want a color-coded graph** where Areas/Projects/Tasks are visually distinct? See [Graph View colors preset](../graph-colors.md).

## Dataview: cross-stream query

«Show me every Task that touches the *Деньги и материальное* area, no matter which project owns it»:

```dataview
TABLE WITHOUT ID
  file.link as Task,
  ems__Effort_parent as Project,
  ems__Effort_area as Areas,
  ems__Effort_status as Status
FROM ""
WHERE contains(exo__Instance_class, "ems__Task")
  AND contains(ems__Effort_area, [[area-money]])
SORT ems__Effort_plannedStartTimestamp DESC
```

Swap the wikilink for any other Area file and you get an instant cross-project view of that stream. This is the core affordance — **no folder reorganisation required** to see «all money-related tasks», because the data is already in the graph.

## Why this is **not** «нечитаемая кракозябра»

The folder-tree intuition says: *«если задача в трёх местах, у меня три копии, и я путаюсь»*. The multi-area pattern breaks that intuition in three ways:

1. **One file, many edges.** There is exactly one markdown file for the task. Nothing is duplicated. Backlinks are automatic — you never maintain them.
2. **Filter, don't move.** To see «only *money* stream» you run the Dataview query above; you don't physically move the file anywhere. The file stays where it is; the *view* changes.
3. **File-in-three-folders is impossible anyway.** Folder-based PKM cannot put one file in three folders without symlinks or copies. The multi-area pattern is the *cheaper* alternative, not the messier one.

If the graph feels noisy, that's a **visualization** problem — turn down edge opacity, filter by class, or use a local graph instead of global. It is not a data model problem.

## Checklist before you save

- [ ] `ems__Effort_parent` has exactly **one** wikilink (the owning Project).
- [ ] `ems__Effort_area` is a **YAML array** (even if it has only one entry today — leaves room to add more later without reformatting).
- [ ] Each wikilink target **actually exists** as a note in the vault. Create stub notes for missing Areas before saving.
- [ ] You asked yourself: *«does this task also belong to another area?»* — if yes, add it now, not «later».

## See also

- [Task-note vs Checkbox](../task-vs-checkbox.md) — when a Task note is overkill and a checkbox is enough. Decision tree Q1 is literally *«does this touch 2+ areas?»* — and the answer routes you straight here.
- [The first 90 minutes](../first-90-minutes.md) — minute 50–65 is where multi-area linking first appears in the walkthrough.
- [Graph View colors](../graph-colors.md) — make the multi-edge graph readable at a glance.
