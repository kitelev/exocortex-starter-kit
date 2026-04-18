# Regression invariants — per-query documentation

Each `.rq` file under this directory is a SPARQL `SELECT` query executed by
`scripts/check-invariants.js`. A clean vault returns **0 rows**; every row the
runner receives becomes one GitHub Actions `::error file=…::…` annotation.

> **Why no `#` headers inside `.rq` files?** The pinned CLI
> (`@kitelev/exocortex-cli@15.98.7`) crashes on leading `#` SPARQL comments
> (upstream [kitelev/exocortex#2835](https://github.com/kitelev/exocortex/issues/2835)).
> Human-readable documentation therefore lives in this README; `.rq` files stay
> body-only. When the upstream parser is fixed the notes can migrate into each
> file's header — the content below is already in the `What / Why / Output / Notes`
> shape expected for inline headers.

See the top-level [README.md](../README.md#regression-invariants) for the gate
description, adding-a-new-invariant workflow, kill-switch, and limitations.

---

## 01 — `01-task-has-status.rq`

- **What:** finds `ems__Task` assets missing an `ems__Effort_status` edge.
- **Why:** tasks without a status break Commands-panel filters, Daily/Weekly
  review roll-ups, and effort aggregations. Orphans accumulate silently.
- **Output:** `?task` (subject IRI/UUID), `?issue` (human-readable message for
  the GHA annotation).
- **Notes:** Task class matched via either ns URI or UUID-file-IRI
  (`"|ems__Task]]"` suffix) to survive CLI-vs-plugin triple-store divergence.

## 02 — `02-done-has-end-timestamp.rq`

- **What:** `ems__Task` in Done status must carry an `ems__Effort_endTimestamp`
  of datatype `xsd:dateTime`.
- **Why:** Done without an endTimestamp breaks productivity roll-ups; a bare
  `"null"` literal would slip past a plain `EXISTS` check, hence the
  `DATATYPE` filter.
- **Output:** `?task`, `?issue`.
- **Notes:** Done status matched via ns URI or UUID-file-IRI suffix (same
  rationale as `01`).

## 03 — `03-unique-asset-uid.rq`

- **What:** no two assets may share the same `exo__Asset_uid` literal.
- **Why:** duplicate UIDs silently corrupt joins across the graph and break
  backlink / frontmatter UID-to-file resolution.
- **Output:** `?task` (first subject IRI), `?issue` (message naming the
  duplicate UID).
- **Notes:** implemented as a self-join rather than `GROUP BY / HAVING`; both
  collision participants are reported as independent rows so each one gets its
  own annotation.

## 04 — `04-no-area-parent-cycles.rq`

- **What:** detects cycles in `ems__Area_parent` via the property-path `+`
  transitive closure (subject reachable from itself).
- **Why:** cycles trap downstream walks (area aggregation, layout breadcrumbs)
  in infinite loops or arbitrary-depth recursion.
- **Output:** `?task` (Area IRI caught in the cycle), `?issue`.
- **Notes:** `FILTER(isIRI(?task))` guards against literal-UUID twins emitted
  by the v15.98.x triple store. Worst-case `O(N²)`; acceptable for
  <100 Areas — see [README "Limitations"](../README.md#limitations).

## 05 — `05-relates-wikilink-resolves.rq`

- **What:** every `ems__Effort_relates` target must resolve to an asset
  carrying an `exo__Asset_uid`.
- **Why:** dangling wikilinks fracture the graph — broken Related Efforts
  panels, orphan IRIs, stale references after file renames.
- **Output:** `?task` (subject), `?issue` (annotation naming the unresolved
  target).
- **Notes:** accepts both IRI targets (plugin file IRI / CLI ns URI) and
  literal `"[[…]]"` wikilink strings to cover both triple-store shapes.
