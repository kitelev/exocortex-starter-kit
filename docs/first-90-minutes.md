# The first 90 minutes — a guided walkthrough

> **Who this is for:** you installed Exocortex 15 minutes ago and already feel lost. Everything below is a strictly ordered sequence. Do the steps in order, don't skip ahead, don't try to understand the big picture yet — the big picture clicks around minute 60.

**Promise:** if you follow this document end-to-end, by minute 30 you will have a working Area → Project → Task hierarchy; by minute 60 you will know when to use a Task note vs a checkbox; by minute 90 you will have answered the question "what did I build this hour?" out loud and the mental model will stick.

**Source of this walkthrough:** Ваня Холькин, 2026-04-12 — spent 1h 47m in self-remodeling loops (`08:10 → 09:57`) before the model clicked. This doc collapses that into 30 predictable minutes. [Issue #40](https://github.com/kitelev/exocortex-starter-kit/issues/40).

**Before you start — three preconditions:**
1. Obsidian is installed and open.
2. You have a vault — can be brand new; if not, create one via `File → New vault`.
3. You completed [Installation](../README.md#installation) — the `starter-kit/` folder is inside your vault.

**Stuck? Claude fallback.** At any step, if something feels wrong or unclear, paste this into Claude Code / Claude Desktop:
> *"I'm on step N of the Exocortex first-90-minutes walkthrough. I see X on screen, expected Y. What should I do?"*
> — and attach a screenshot. See the [AI onboarding companion issue](https://github.com/kitelev/exocortex-starter-kit/issues/41) for a richer flow.

---

## Minute 0–5 — verify the plugin is alive

**Goal:** prove that Exocortex is loaded before you invest in content.

1. Open **Settings → Community plugins**.
2. Confirm **Exocortex** is in the *Installed plugins* list with the toggle **on**. If it's not installed, follow [plugin README](https://github.com/kitelev/exocortex) and come back.
3. Close settings.
4. Open any `.md` file in your vault that has no frontmatter.
5. Switch to **Reading Mode** (`Cmd/Ctrl + E`). If you see nothing broken — you're good. No buttons appear on a plain note; that's expected. Buttons appear only on Exocortex-typed assets.

**If you see "Service not found: createRelatedProject" in the console** — your plugin is older than v15.92.0. Update via [BRAT](https://github.com/TfTHacker/obsidian42-brat) or re-download from the plugin releases page.

**Time check:** 5 minutes. If longer, you probably got sidetracked into settings — that's fine, continue.

---

## Minute 5–20 — your first Area

**Goal:** create one Area asset. Not three. Not a perfectly-designed hierarchy. **One.**

Areas represent life / work domains that are permanent: "Health", "Career", "Family", "Personal Strategy 2026". Start with exactly one — you can add more later, but adding more now is the #1 reason people never finish this walkthrough.

**Steps:**

1. In the left sidebar File Explorer, right-click your vault root → **New note**.
2. Name it with any UUID-style placeholder. The actual Exocortex convention uses real UUIDs (generate with `uuidgen` on macOS / Linux), but for this walkthrough a simple placeholder like `area-01.md` is fine — we're learning, not building production assets.
3. Paste this frontmatter at the top of the new note (between two `---` lines):

```yaml
---
exo__Instance_class:
  - "[[82c74542-1b14-4217-b852-d84730484b25|ems__Area]]"
exo__Asset_label: "Personal Strategy 2026"
exo__Asset_uid: area-01
---
```

4. Save the file (`Cmd/Ctrl + S`).
5. Switch to Reading Mode (`Cmd/Ctrl + E`). Expect to see:
   - An **Asset Relations** table (empty — the Area has no relations yet).
   - In the File Explorer sidebar, the filename `area-01.md` now shows as **"Personal Strategy 2026"** instead of `area-01`. This is the [File Explorer label patch](https://github.com/kitelev/exocortex/pull/2805) shipped in plugin v15.98.3.
6. **Stop and look.** You just created an Exocortex asset. The plugin recognizes it because `exo__Instance_class` points to the Area metaclass UUID, not because of the filename.

**Pitfall:** if the relations panel shows nothing at all (not even an empty section), the plugin may not have indexed the new file yet. Wait 2–3 seconds or toggle Reading Mode off and on with `Cmd/Ctrl + E`.

**Time check:** 20 minutes. You should have exactly **one** file named `area-01.md` rendered as "Personal Strategy 2026".

---

## Minute 20–35 — your first Project, and look at the graph

**Goal:** create one Project inside your Area and immediately see them linked in the graph view.

Note: Exocortex uses a flat **Area → Project → Task** hierarchy in its core ontology. If you're coming from a Goal/OKR system and miss a dedicated "Goal" class, treat long-lived Projects as Goals — the model doesn't enforce the distinction, and adding a middle layer on day 1 is exactly the over-design trap this walkthrough exists to prevent.

1. Create `project-01.md` with this frontmatter:

```yaml
---
exo__Instance_class:
  - "[[7db5eeff-718a-49b0-8d2b-39b084a356e3|ems__Project]]"
exo__Asset_label: "Launch side-project #1"
exo__Asset_uid: project-01
ems__Effort_area:
  - "[[area-01|Personal Strategy 2026]]"
---
```

2. Save + Reading Mode.
3. Open the note `area-01.md` — you should see **"Launch side-project #1"** appear in its Asset Relations table. That's the Area receiving a back-reference from the Project via `ems__Effort_area`.
4. Now open **Obsidian Graph View** (`Cmd/Ctrl + G` or click the graph icon in the left ribbon). You should see two nodes connected by a line.
5. **Sit with this for 60 seconds.** This is the first moment where Exocortex stops being "files with frontmatter" and becomes "a knowledge graph". The line in the graph view comes from the single `[[area-01]]` wikilink in the Project's frontmatter. Nothing else.

**If the graph shows two disconnected nodes:** the wikilink target probably doesn't resolve. Click the link in Reading Mode — if Obsidian says "Create new note", your `[[area-01]]` wikilink is pointing at a non-existent filename. Make sure `area-01.md` exists literally at that name.

**Time check:** 35 minutes. Two files, one wikilink, one visible graph edge. Don't create a third asset yet.

---

## Minute 35–50 — Task note, and **the checkbox moment**

**Goal:** internalize the single most confusing distinction in Exocortex — when to use a **Task note** and when to use a **checkbox inside a note**.

1. Create `task-01.md` — this is a **Task note**:

```yaml
---
exo__Instance_class:
  - "[[1b20a8f0-d745-4e93-91db-4531b3df120e|ems__Task]]"
exo__Asset_label: "Draft landing page copy"
exo__Asset_uid: task-01
ems__Effort_parent:
  - "[[project-01|Launch side-project #1]]"
---
```

2. Save. Open `project-01.md` in Reading Mode. You should see `task-01` ("Draft landing page copy") in its Asset Relations table.
3. Now, in the **body** of `project-01.md` (below the frontmatter), add this line:

```markdown
- [ ] Buy domain name
```

Save.

4. **Look at the Asset Relations table on the Project note.** You should see `task-01` listed. You should **NOT** see "Buy domain name".
5. Open the Graph View. Expand the `project-01` node. You'll see:
   - An edge to `task-01` ✅
   - **No edge** to "Buy domain name" ❌

**This is the moment.** A Task note (`task-01.md`) is a first-class Exocortex asset — it participates in the graph, gets status buttons, rolls up into project/area filters, can be queried via SPARQL. A checkbox (`- [ ] Buy domain name`) is just Markdown text — it doesn't exist to Exocortex.

**The practical rule** (from [task-vs-checkbox.md](task-vs-checkbox.md)):
- Need to track status transitions? **Task note.**
- Need it to show up in area/project rollups? **Task note.**
- Is it a 2-minute thing you'll do before closing this note? **Checkbox.**

Remember this moment. Most first-hour confusion comes from accidentally putting real work inside checkboxes and then wondering why nothing shows up anywhere.

**Time check:** 50 minutes. You should have three files (`area-01`, `project-01`, `task-01`) and one checkbox living inside `project-01`'s body.

---

## Minute 50–65 — a multi-area Task

**Goal:** prove to yourself that one Task can belong to multiple Areas, which is the feature that makes Exocortex actually better than a folder tree.

1. Create a second Area, `area-02.md`:

```yaml
---
exo__Instance_class:
  - "[[82c74542-1b14-4217-b852-d84730484b25|ems__Area]]"
exo__Asset_label: "Health"
exo__Asset_uid: area-02
---
```

2. Create a Task `task-02.md` that belongs to **both** Areas simultaneously:

```yaml
---
exo__Instance_class:
  - "[[1b20a8f0-d745-4e93-91db-4531b3df120e|ems__Task]]"
exo__Asset_label: "Morning walk — counts as both planning time and exercise"
exo__Asset_uid: task-02
ems__Effort_area:
  - "[[area-01|Personal Strategy 2026]]"
  - "[[area-02|Health]]"
---
```

3. Open Graph View, zoom in on `task-02`. You'll see **two edges** leaving the same Task node — one to each Area. This is fundamentally different from a folder tree: a file can only live in one folder, but a Task can cleanly belong to multiple conceptual Areas.

4. Open `area-01.md` — `task-02` appears in its relations. Open `area-02.md` — `task-02` appears there too. Same underlying asset, two filter views.

**Why this matters:** 80% of first-hour confusion is "where do I put this Task, it could go in three places". Exocortex answer: put it in all three via `ems__Effort_area: [[A]], [[B]], [[C]]`. You don't have to choose.

**Time check:** 65 minutes. Four files, one cross-area Task. Graph view looks like a small hub-and-spoke.

---

## Minute 65–90 — your first retrospective

**Goal:** make the model stick by articulating what you built, out loud, to yourself or to Claude.

1. Open Graph View. Look at it.
2. Open this file (`first-90-minutes.md`) side-by-side (split with `Cmd/Ctrl + Click` on a note, or drag a tab).
3. Answer these questions, literally — say them out loud or type them into a fresh note:

   - **What does an Area represent in my life?** (Give an example that is NOT from this walkthrough.)
   - **What does a Project add on top of an Area?** Why can't every Area just be a Project?
   - **When would I use a Task note vs a checkbox?** (State the rule in your own words, not mine.)
   - **Why is it okay for a Task to belong to multiple Areas?** What would be broken about a folder-based system?
   - **What's the next concrete thing I want to put into Exocortex** — a real Area / Project / Task from my life? Write its `exo__Asset_label` now as a placeholder, empty file is fine.

4. If you couldn't answer any question confidently, **re-read that section of the walkthrough**. Do not continue creating real-life content until the gap closes — a wrong mental model at hour 1 compounds into a useless vault at hour 10.

5. Optionally: open [task-vs-checkbox.md](task-vs-checkbox.md) and [mobile-capture.md](mobile-capture.md). These are **reference docs, not walkthroughs** — read them when the mental model from above is already in place.

**Time check:** 90 minutes. Congratulations — you survived the cliff that Ваня hit on 2026-04-12. If the mental model didn't click, file an issue at [kitelev/exocortex-starter-kit/issues/40](https://github.com/kitelev/exocortex-starter-kit/issues/40) with "stuck at minute N" and what confused you — that's how this doc gets better.

---

## What to do next

- **Tomorrow:** create your real first Area from your own life, one Project inside it, two Tasks. Nothing more.
- **Day 3:** add more Projects for any active work stream.
- **Week 2:** start using status transitions (`Set Status Doing` / `Done`) on Tasks, read [task-vs-checkbox.md](task-vs-checkbox.md) as a reference.
- **Day 7+:** if you still feel friction, that's the point to think about SPARQL queries and custom commands. Before day 7, stick to the primitives above.

**Anti-pattern warning.** The #1 mistake new users make is spending hours in the first session building a "perfect" hierarchy with 12 Areas, 47 Projects, and a color-coded tag system. **Don't.** Exocortex rewards iterative use, not up-front design. Your vault after week 4 will look nothing like what you'd design on day 1 — start small and let it grow.

---

**Want this walkthrough to get better?** The acceptance criteria for [issue #40](https://github.com/kitelev/exocortex-starter-kit/issues/40) includes screenshots and external user testing. If you want to help, do the walkthrough fresh, record where you got stuck, and open a PR with screenshot suggestions — the maintainer lives in Almaty, the walkthrough benefits from contributors in other timezones.
