# Exocortex Starter Kit

Ontology files for the [Exocortex](https://github.com/kitelev/exocortex) Obsidian plugin. Without these files, the plugin renders layouts but **buttons and commands won't appear**.

## Prerequisites

- **Exocortex plugin** v15.92.0+ (composite status groundings need `$nowLocal` — v15.91.0, and parent-aware Create Project needs `createRelatedProject` — v15.92.0). Earlier plugin versions partially work but will log "Service not found: createRelatedProject" on `Create Project` clicks.
- **[Dataview](https://github.com/blacksmithgu/obsidian-dataview)** community plugin — the Daily Tasks widget on `pn__DailyNote` notes is gated on Dataview being installed and enabled. Status buttons, action panels, and Asset Relations work without it.

## What's Inside

| Folder | Files | Purpose |
|--------|-------|---------|
| `exocmd/` | 193 | Dynamic command definitions — buttons for status transitions, task creation, planning, maintenance |
| `pn/` | 3 | Periodic Notes ontology — Daily Note class for daily planning |
| `uj/` | 17 | User Journey ontology — executable acceptance specs for core workflows (see `uj/journeys/`) |

## Before you start: where does this live?

Exocortex is Obsidian-based, so your vault is just a folder on disk. Pick **one** sync strategy *before* you invest time in content — otherwise your knowledge base lives on one machine only, and you'll rebuild it the day that machine dies.

| Option | Cost | Mobile | E2E encrypted | Best for |
|---|---|---|---|---|
| **[Obsidian Sync](https://obsidian.md/sync)** ([pricing](https://obsidian.md/pricing)) | $4/mo (annual) or $5/mo Standard; $8/mo (annual) Plus | Yes (iOS + Android) | Yes | Casual users who want zero setup |
| **iCloud Drive / Dropbox / Google Drive** | Free tier | Desktop only — **no official mobile support** | No | Cost-averse desktop-only users |
| **Git** (GitHub/GitLab) | Free | Via [obsidian-git](https://github.com/denolehov/obsidian-git) plugin, fragile on mobile | Via repo visibility | Power users who want full history + diff |

**One-line recommendation:**
- **New to this?** Start with Obsidian Sync Standard ($4/mo annual). Zero config, mobile works, you can always switch later — your vault is just files.
- **Developer who lives in git?** Point the vault at a private GitHub repo and use obsidian-git; skip mobile until you need it.
- **Cost-averse, desktop-only?** iCloud Drive or Dropbox works, but understand you're giving up mobile.

Without a sync strategy your vault is a local folder. That's fine for experimenting — just don't build for a week before deciding.

## Installation

### Option A: degit (no .git folder)

```bash
cd /path/to/your/vault
npx degit kitelev/exocortex-starter-kit starter-kit
```

### Option B: git clone (for updates via `git pull`)

```bash
cd /path/to/your/vault
git clone https://github.com/kitelev/exocortex-starter-kit starter-kit
```

### Option C: Download ZIP

1. [Download ZIP](https://github.com/kitelev/exocortex-starter-kit/archive/refs/heads/main.zip)
2. Extract into your vault

### After Installation

The plugin detects new files automatically — **no restart needed**. Open any note with `exo__Instance_class: ems__Task` in Reading Mode and you should see action buttons.

## Folder Placement

The Exocortex plugin scans your **entire vault** for ontology files. You can place the `starter-kit/` folder anywhere:

```
My Vault/
├── starter-kit/        # ← here
│   ├── exocmd/
│   └── pn/
├── Areas/
├── Projects/
└── Tasks/
```

Or rename it, nest it deeper — whatever fits your vault structure.

## Updating

If you installed with `git clone`:

```bash
cd /path/to/your/vault/starter-kit
git pull
```

If you installed with `degit` or ZIP — re-download and replace.

## Compatibility

| Starter Kit Version | Plugin Version |
|---------------------|---------------|
| v1.7+ | v15.92.0+ (parent-aware `Create Project` via `createRelatedProject`) |
| v1.6.x | v15.91.0+ (composite `Set Status Doing` / `Done` need `$nowLocal`) |
| v1.5.x | v15.86+ |

## Getting Started

Once the files are in your vault, these docs answer the questions new users hit in the first hour:

- **[🕒 The first 90 minutes](docs/first-90-minutes.md)** — strictly ordered walkthrough from plugin-check to "I get it"; if you read nothing else, read this.
- **[🤖 AI onboarding companion](docs/ai-companion.md)** — copy-paste Claude prompt that decomposes your goals into Area → Project → Task for you; optional accelerator for AI-native users.
- **[Task-note vs checkbox](docs/task-vs-checkbox.md)** — decision tree for "do I need a full Task note, or is a checkbox enough?"
- **[Mobile capture](docs/mobile-capture.md)** — phone → inbox workflow for iOS and Android
- **[Task reminders](docs/reminders.md)** — wire `ems__Effort_plannedStartTimestamp` to desktop notifications via the Reminder community plugin
- **[Calendar integration](docs/calendar-integration.md)** — Dataview weekly view, Day Planner, and why the Calendar plugin is not what you think it is
- **[Graph View colors](docs/graph-colors.md)** — colorblind-safe preset that paints Areas / Projects / Tasks / Concepts in distinct hues

## What Are These Files?

Each button you see in the Exocortex layout (Set Status, Create Task, Plan on Today, etc.) is defined by 4 vault files:

- **Command** — what the button does (label, icon, category)
- **CommandBinding** — which note types show the button (e.g., only Tasks)
- **Precondition** — when the button is visible (SPARQL ASK query)
- **Grounding** — how the action executes (set property, call service)

This is the [vault-driven architecture](https://github.com/kitelev/exocortex) — commands are data, not code.

## License

MIT — same as the Exocortex plugin.
