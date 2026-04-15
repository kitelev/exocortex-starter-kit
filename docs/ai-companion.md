# AI onboarding companion

*A copy-paste prompt that turns Claude into an Exocortex onboarding coach — because «попросил Claude декомпозировать» is how one real user went from confused to productive in 30 minutes.*

> Source: written to close [issue #41](https://github.com/kitelev/exocortex-starter-kit/issues/41), based on a **signal, not a pain**, from vault asset `37a88fda-74f3-4b26-bc93-8ebdac701c70` (Ваня Холькин, 2026-04-12, 08:10 → 08:40).

## Why this exists

The observation that prompted this page:

> 08:10 — «Программа кажется странной, ничего не понимаю».
> 08:40 — «Попросил Claude декомпозировать мои действия до простейших. Через полчаса начала прорисовываться структура, и я начал понимать базовые действия для создания основных сущностей.»

Thirty minutes. One prompt. Structure became visible. The only problem: **the user had to think of asking**. AI-native users do this instinctively; everyone else abandons at «программа странная» and never finds out that a 30-minute Claude session would unblock them.

This page gives you the prompt so you don't have to invent it.

## The prompt (copy-paste into any Claude surface)

```text
I'm learning Exocortex starter-kit — an ontology-driven Obsidian vault
for personal management. It uses a flat hierarchy: Area → Project → Task.
There is no Goal class and no OKRs; long-lived Projects stand in for
goals.

My goal: [FILL IN — e.g., "organize my 2026 personal strategy"]
My current state: [FILL IN — e.g., "I have 5 projects in my head,
nothing in Obsidian yet"]

Your job:

1. Decompose my goal into an Area → Project → Task hierarchy using
   Exocortex ontology classes (ems__Area, ems__Project, ems__Task).
   Do NOT invent other classes.

2. For each proposed asset, show me the exact markdown frontmatter
   I should paste into a new note. Use this UUID format for
   exo__Instance_class:
       "[[<class-uuid>|<class-alias>]]"
   The three metaclass UUIDs you need are EXACTLY these — do not
   invent or guess others:
       ems__Area    → 82c74542-1b14-4217-b852-d84730484b25
       ems__Project → 7db5eeff-718a-49b0-8d2b-39b084a356e3
       ems__Task    → 1b20a8f0-d745-4e93-91db-4531b3df120e

3. If a Task logically belongs to two Areas, use the multi-area
   pattern — an ARRAY in ems__Effort_area with multiple wikilinks.
   Never create two copies of the same Task.

4. Ask me ONE clarifying question at a time when you need more
   context. Do not front-load requirements gathering.

5. After I create the first Area, walk me through creating the first
   Project inside it, then the first Task inside the Project — one
   step at a time.

6. When I ask "what next?", give me ONE next concrete action — not
   a list. I'll ask again when I'm ready.
```

## How to use it

Any Claude surface works. Pick the one closest to your vault:

| Surface | Install | Why it's good |
|---|---|---|
| **[Claude Code](https://claude.com/claude-code) CLI** | `npm install -g @anthropic-ai/claude-code` (or see install page) | Agent runs in your terminal, can `cd` into the vault folder, grep for existing notes, and verify what you already have. Best dogfooding. |
| **[Claude Desktop](https://claude.ai/download)** | Download from claude.ai | File-upload support; paste the prompt + drag in a note for context. |
| **[claude.ai](https://claude.ai)** (web) | No install | Fastest «try it in 30 seconds» path. No vault access, but the prompt is self-contained. |
| **Terminal inside Obsidian** | [obsidian-terminal](https://github.com/polyipseity/obsidian-terminal) | Runs Claude Code CLI without leaving Obsidian — agent sees your open notes. |

**Workflow.** New chat → paste prompt → fill in the two `[FILL IN]` placeholders → hit send → follow the one-question-at-a-time flow. Create notes in Obsidian as the assistant proposes them.

## What to do *before* you use it

These three checks take two minutes and save a confused hour:

1. **Plugin installed and enabled.** Settings → Community plugins → search «Exocortex» or install via [BRAT](https://github.com/TfTHacker/obsidian42-brat). Confirm version is ≥ v15.92.0 (see [README prerequisites](../README.md#prerequisites)).
2. **Starter-kit folder present.** `ls starter-kit/ems/` from the vault root should show UUID-named `.md` files. If not, you skipped step 1 of Installation — go back to [README](../README.md#installation).
3. **Dataview enabled.** The AI may suggest Dataview queries; they silently render nothing without the plugin. See [prerequisites](../README.md#prerequisites).

## Limitations (honest)

- **The prompt is starter-kit-aware.** It assumes the three metaclass UUIDs listed above exist at those exact IDs. If you've customized the ontology (renamed classes, reassigned UUIDs), update the prompt to match *your* vault before pasting.
- **Claude can hallucinate UUIDs.** If the assistant offers a UUID that's *not* one of the three listed above, **grep-verify** it against `starter-kit/ems/<uuid>.md` before trusting it. Treat any unfamiliar UUID as suspect.
- **No persistent memory across chats** (unless you use Claude Code with a project context file). Each new conversation starts cold — re-paste the prompt each time, or keep one long chat.
- **External user validation deferred.** This prompt is based on one user's experience (Ваня, 2026-04-12). It has not been tested with a cold user who had no Exocortex exposure. If you try it and it stalls, please comment on [#41](https://github.com/kitelev/exocortex-starter-kit/issues/41) with where it broke — that's the fastest path to v2.

## Fallback

If you don't have Claude access, or the AI session stalls, fall back to the text walkthrough: **[The first 90 minutes](first-90-minutes.md)**. Same destination, longer path, no AI needed.

## See also

- [The first 90 minutes](first-90-minutes.md) — the non-AI version of this page.
- [Task-note vs checkbox](task-vs-checkbox.md) — when the AI proposes a Task, double-check the decision tree to confirm it shouldn't have been a checkbox.
- [Multi-area task pattern](patterns/multi-area-task.md) — the canonical YAML for Tasks that touch more than one Area. Cite this page to Claude if it tries to duplicate a Task across Areas.
