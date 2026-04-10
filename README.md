# Exocortex Starter Kit

Ontology files for the [Exocortex](https://github.com/kitelev/exocortex) Obsidian plugin. Without these files, the plugin renders layouts but **buttons and commands won't appear**.

## What's Inside

| Folder | Files | Purpose |
|--------|-------|---------|
| `exocmd/` | 188 | Dynamic command definitions — buttons for status transitions, task creation, planning, maintenance |
| `pn/` | 3 | Periodic Notes ontology — Daily Note class for daily planning |

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
| v1.x | v15.86+ |

## What Are These Files?

Each button you see in the Exocortex layout (Set Status, Create Task, Plan on Today, etc.) is defined by 4 vault files:

- **Command** — what the button does (label, icon, category)
- **CommandBinding** — which note types show the button (e.g., only Tasks)
- **Precondition** — when the button is visible (SPARQL ASK query)
- **Grounding** — how the action executes (set property, call service)

This is the [vault-driven architecture](https://github.com/kitelev/exocortex) — commands are data, not code.

## License

MIT — same as the Exocortex plugin.
