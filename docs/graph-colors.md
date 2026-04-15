# Graph View colors — ontology preset

> **Who this is for:** you've built a few Areas, Projects, and Tasks, opened Obsidian's Graph View, and everything is the same dim color. You want to *see* the ontology.

This page ships a pre-configured color-group preset that paints Exocortex classes in a **colorblind-safe** palette (Okabe-Ito). One-time install, then the graph reads like a semantic map instead of a grey cloud.

**Source of this preset:** Ваня Холькин, 2026-04-12 11:12 — «Надо бы разобраться с цветами для наглядности». [Issue #39](https://github.com/kitelev/exocortex-starter-kit/issues/39).

## The palette

| Class | Color | Hex | Why |
|---|---|---|---|
| `ems__Area` | 🟧 orange | `#E69F00` | Areas are containers — warm, stable, always visible |
| `ems__Project` | 🟦 deep blue | `#0072B2` | Projects are the main anchor nodes |
| `ems__Task` | 🔵 sky blue | `#56B4E9` | Tasks are many and lighter — same hue family as Projects, lower weight |
| `ims__Concept` | 🟪 pink | `#CC79A7` | Concepts live in a different semantic dimension — distinct hue |
| `ztlk__PermanentNote` | 🟩 green | `#009E73` | Permanent notes are growing knowledge — fresh color |
| `ztlk__FleetingNote` | ⬜ gray | `#999999` | Fleeting notes are ephemeral — muted on purpose |

Anything not matching a class group falls back to Obsidian's default text color.

## Install — option A (UI, two minutes)

1. Open Obsidian **Settings → Appearance** (not needed — just open Graph View first).
2. Open **Graph View** (`Cmd/Ctrl + G`).
3. In the top-right panel, expand **Groups**.
4. For each row in the palette table above, click **New group**, paste the query, and pick the hex color. Queries to paste:

```
["exo__Instance_class":"ems__Area"]
["exo__Instance_class":"ems__Project"]
["exo__Instance_class":"ems__Task"]
["exo__Instance_class":"ims__Concept"]
["exo__Instance_class":"ztlk__PermanentNote"]
["exo__Instance_class":"ztlk__FleetingNote"]
```

5. Done. The preset persists in your vault's `.obsidian/graph.json` automatically.

## Install — option B (file copy, ten seconds)

If you don't yet have a custom `.obsidian/graph.json` in your vault (or you don't mind overwriting it):

```bash
# From your vault root:
cp starter-kit/assets/graph-colors.json .obsidian/graph.json
```

Reload Obsidian (`Cmd/Ctrl + R` or Command Palette → "Reload app without saving").

If you **do** already have a customized `graph.json`, don't copy-overwrite — merge only the `colorGroups` array. A 60-second manual merge:

```bash
# Open both files, copy the "colorGroups": [...] block from 
# starter-kit/assets/graph-colors.json into your .obsidian/graph.json
# replacing (or augmenting) the existing colorGroups.
```

Keep the `_comment` and `_palette` keys out of your merged file — they are documentation-only and Obsidian ignores unknown top-level keys.

## How the queries work

Each color group uses Obsidian's property search syntax:

```
["exo__Instance_class":"ems__Task"]
```

This matches files whose frontmatter `exo__Instance_class` property contains the string `"ems__Task"`. Since starter-kit stores class references as `[[<UUID>|ems__Task]]` wikilinks, the alias text is included in the searchable value, and the query matches. **Do not** change the syntax to match the raw UUID — aliases are the stable, human-readable surface.

## Customizing

To change a color: Graph View → **Groups** → click the color swatch next to the group → pick a new hex. Obsidian saves automatically.

To add a class: new **Groups** row, query `["exo__Instance_class":"<your_class_name>"]`.

To remove a group: click the `×` next to it in the Groups panel.

## Why Okabe-Ito

The six colors in this preset are from the [Okabe-Ito palette](https://jfly.uni-koeln.de/color/), designed to be distinguishable for viewers with protanopia, deuteranopia, and tritanopia (the three most common forms of color blindness, ~8% of men). If you don't need colorblind safety, pick anything — but these are a defensible default.

## Related

- **[The first 90 minutes](first-90-minutes.md)** — step 2 mentions the graph view; this preset makes that step visually richer.
- **[Task-note vs checkbox](task-vs-checkbox.md)** — explains why only Task notes (not checkboxes) show up as colored nodes.
