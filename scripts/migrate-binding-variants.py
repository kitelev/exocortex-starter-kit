#!/usr/bin/env python3
"""
RFC-024 Phase 2 (T5.5): Apply `exocmd__CommandBinding_variant` inline shorthand
to existing CommandBinding markdown assets per category default map.

Idempotent: skips bindings that already declare a variant.
Wikilink-safe: pure string-edit on frontmatter, никогда не round-trips YAML through a parser.

Category default map (per RFC-024 §4 Phase 0/Phase 2):
  - creation              → primary
  - status (Done label)   → success
  - status (Blocked)      → warning
  - status (Cancelled)    → danger
  - status (other)        → secondary
  - planning              → secondary
  - criticality           → warning
  - maintenance           → muted
  - maintenance-complex   → muted

Usage:
  python3 scripts/migrate-binding-variants.py [--dry-run] [--root .]
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

COMMAND_BINDING_CLASS_UID = "3677039a-a5a8-4402-9a07-f8f18fe384ad"

# Match the Instance_class line for CommandBinding (UUID may include alias `|exocmd__CommandBinding`)
INSTANCE_CLASS_RE = re.compile(
    r'exo__Instance_class:\s*\n\s*-\s*"?\[\[' + COMMAND_BINDING_CLASS_UID + r'(?:\|[^\]]+)?\]\]"?'
)
GROUP_RE = re.compile(r'^exocmd__CommandBinding_group:\s*"?([^"\n]+?)"?\s*$', re.MULTILINE)
LABEL_RE = re.compile(r'^exo__Asset_label:\s*"?([^"\n]+?)"?\s*$', re.MULTILINE)
VARIANT_RE = re.compile(r'^exocmd__CommandBinding_variant:', re.MULTILINE)
ORDER_RE = re.compile(r'^(exocmd__CommandBinding_order:.*\n)', re.MULTILINE)
GROUP_LINE_RE = re.compile(r'^(exocmd__CommandBinding_group:.*\n)', re.MULTILINE)
FRONTMATTER_RE = re.compile(r'^---\n(.*?\n)---\n', re.DOTALL)


def resolve_variant(group: str, label: str) -> str:
    g = (group or "").strip().lower()
    lab = (label or "").lower()
    if g == "creation":
        return "primary"
    if g == "criticality":
        return "warning"
    if g in ("maintenance", "maintenance-complex"):
        return "muted"
    if g == "status":
        if "done" in lab:
            return "success"
        if "blocked" in lab:
            return "warning"
        if "cancelled" in lab or "canceled" in lab:
            return "danger"
        return "secondary"
    # planning + anything else
    return "secondary"


def process_file(path: Path, dry_run: bool) -> tuple[bool, str]:
    """Returns (changed, status)."""
    text = path.read_text(encoding="utf-8")
    fm_match = FRONTMATTER_RE.match(text)
    if not fm_match:
        return (False, "no-frontmatter")
    fm = fm_match.group(1)
    if not INSTANCE_CLASS_RE.search(fm):
        return (False, "not-a-binding")
    if VARIANT_RE.search(fm):
        return (False, "already-has-variant")

    group_m = GROUP_RE.search(fm)
    label_m = LABEL_RE.search(fm)
    group = group_m.group(1) if group_m else ""
    label = label_m.group(1) if label_m else ""
    variant = resolve_variant(group, label)

    new_line = f'exocmd__CommandBinding_variant: "{variant}"\n'

    # Insert after CommandBinding_order if present, else after CommandBinding_group
    insert_after = ORDER_RE.search(fm) or GROUP_LINE_RE.search(fm)
    if not insert_after:
        return (False, "no-anchor-line")

    new_fm = fm[: insert_after.end()] + new_line + fm[insert_after.end():]
    new_text = "---\n" + new_fm + "---\n" + text[fm_match.end():]

    if not dry_run:
        path.write_text(new_text, encoding="utf-8")
    return (True, f"variant={variant} group={group}")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--root", default=".")
    args = ap.parse_args()

    root = Path(args.root) / "exocmd"
    if not root.is_dir():
        print(f"ERROR: {root} not found (run from starter-kit root)", file=sys.stderr)
        return 2

    changed = 0
    skipped = 0
    skipped_reasons: dict[str, int] = {}
    by_variant: dict[str, int] = {}

    for path in sorted(root.rglob("*.md")):
        ok, status = process_file(path, args.dry_run)
        if ok:
            changed += 1
            variant = status.split()[0].split("=", 1)[1]
            by_variant[variant] = by_variant.get(variant, 0) + 1
            print(f"[+] {path.relative_to(root.parent)} → {status}")
        else:
            skipped += 1
            skipped_reasons[status] = skipped_reasons.get(status, 0) + 1

    print()
    print(f"Migrated: {changed}")
    print(f"Skipped:  {skipped}")
    for reason, count in sorted(skipped_reasons.items()):
        print(f"  {reason}: {count}")
    print("Variant distribution:")
    for variant, count in sorted(by_variant.items()):
        print(f"  {variant}: {count}")
    if args.dry_run:
        print("\n(dry-run; no files modified)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
