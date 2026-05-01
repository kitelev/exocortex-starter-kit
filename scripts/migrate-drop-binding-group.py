#!/usr/bin/env python3
"""
RFC command-variant-split Phase 5 (T5): Drop `exocmd__CommandBinding_group` property
from CommandBinding markdown assets in starter-kit.

Per RFC f1dc284a-eadc-4d0e-8e72-323e999ea510:
  - `_group` deprecated in favor of `Command_category` (sectioning) +
    `CommandBinding_variant` (button colour override).
  - Starter-kit defaults to category fallback; explicit `_variant` overrides
    remain user-on-demand. This migration does NOT add `_variant`.

Behaviour:
  - Idempotent: re-runnable; skips files already without `_group`.
  - Crash-safe: per-file try/except — one bad file doesn't abort the batch.
  - Per-file edits:
      1. Remove the `exocmd__CommandBinding_group: ...` frontmatter line.
      2. Set `exo__Asset_updatedAt: <ISO-now>` (insert after `createdAt` if missing,
         otherwise replace existing value).
  - Wikilink-safe: pure string-edit, no YAML round-trip.

Usage:
  python3 scripts/migrate-drop-binding-group.py [--dry-run] [--apply]
                                                [--batch-size N] [--root .]
                                                [--commit]

  --dry-run     (default) report what would change, no writes.
  --apply       perform writes.
  --commit      with --apply, git-commit each batch (default batch=10 files).
                Requires running inside a git worktree.
"""
from __future__ import annotations

import argparse
import re
import subprocess
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

COMMAND_BINDING_CLASS_UID = "3677039a-a5a8-4402-9a07-f8f18fe384ad"

INSTANCE_CLASS_RE = re.compile(
    r'exo__Instance_class:\s*\n\s*-\s*"?\[\[' + COMMAND_BINDING_CLASS_UID + r'(?:\|[^\]]+)?\]\]"?'
)
GROUP_LINE_RE = re.compile(r'^exocmd__CommandBinding_group:[^\n]*\n', re.MULTILINE)
UPDATED_AT_RE = re.compile(r'^(exo__Asset_updatedAt:)[^\n]*$', re.MULTILINE)
CREATED_AT_RE = re.compile(r'^(exo__Asset_createdAt:[^\n]*\n)', re.MULTILINE)


def now_iso() -> str:
    tz = timezone(timedelta(hours=5))  # Asia/Almaty UTC+5
    return datetime.now(tz).strftime("%Y-%m-%dT%H:%M:%S%z")


def transform(text: str, ts: str) -> tuple[str, bool]:
    """Return (new_text, changed)."""
    if not GROUP_LINE_RE.search(text):
        return text, False
    new = GROUP_LINE_RE.sub('', text, count=1)
    if UPDATED_AT_RE.search(new):
        new = UPDATED_AT_RE.sub(rf'\1 "{ts}"', new, count=1)
    else:
        new = CREATED_AT_RE.sub(rf'\1exo__Asset_updatedAt: "{ts}"\n', new, count=1)
    return new, True


def is_command_binding(text: str) -> bool:
    return bool(INSTANCE_CLASS_RE.search(text))


def git_commit(root: Path, files: list[Path], batch_idx: int, total_batches: int) -> None:
    rels = [str(f.relative_to(root)) for f in files]
    subprocess.run(["git", "-C", str(root), "add", "--"] + rels, check=True)
    msg = (
        f"chore(starter-kit): drop CommandBinding_group from batch "
        f"{batch_idx}/{total_batches} ({len(files)} files)\n\n"
        "Per RFC command-variant-split Phase 5 (T5).\n"
        "RFC: f1dc284a-eadc-4d0e-8e72-323e999ea510"
    )
    subprocess.run(["git", "-C", str(root), "commit", "-m", msg], check=True)


def main() -> int:
    p = argparse.ArgumentParser()
    mode = p.add_mutually_exclusive_group()
    mode.add_argument("--dry-run", action="store_true", default=True)
    mode.add_argument("--apply", action="store_true")
    p.add_argument("--commit", action="store_true",
                   help="With --apply, git-commit per batch.")
    p.add_argument("--batch-size", type=int, default=10)
    p.add_argument("--root", type=Path, default=Path("."))
    args = p.parse_args()

    apply = args.apply
    root = args.root.resolve()
    exocmd_dir = root / "exocmd"
    if not exocmd_dir.is_dir():
        print(f"FATAL: {exocmd_dir} not found", file=sys.stderr)
        return 2

    candidates = sorted(exocmd_dir.rglob("*.md"))
    ts = now_iso()
    changed: list[Path] = []
    skipped_not_binding = 0
    skipped_no_group = 0
    errors: list[tuple[Path, str]] = []

    for f in candidates:
        try:
            text = f.read_text(encoding="utf-8")
        except OSError as e:
            errors.append((f, f"read: {e}"))
            continue
        if not is_command_binding(text):
            skipped_not_binding += 1
            continue
        new, did = transform(text, ts)
        if not did:
            skipped_no_group += 1
            continue
        if apply:
            try:
                f.write_text(new, encoding="utf-8")
            except OSError as e:
                errors.append((f, f"write: {e}"))
                continue
        changed.append(f)

    print(f"Mode: {'APPLY' if apply else 'DRY-RUN'}")
    print(f"CommandBinding files scanned: {len(candidates) - skipped_not_binding}")
    print(f"  skipped (no _group, idempotent): {skipped_no_group}")
    print(f"  changed: {len(changed)}")
    print(f"  errors: {len(errors)}")
    for f, e in errors:
        print(f"  ERR {f.relative_to(root)}: {e}", file=sys.stderr)

    if apply and args.commit and changed:
        bs = args.batch_size
        batches = [changed[i:i + bs] for i in range(0, len(changed), bs)]
        for i, batch in enumerate(batches, 1):
            git_commit(root, batch, i, len(batches))
        print(f"Committed {len(batches)} batch(es) of up to {bs} files each.")

    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
