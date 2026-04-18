#!/usr/bin/env bash
# Privacy scanner — grep staged or PR-diff files for private markers
# that should never land in the public starter-kit repo.
#
# Patterns intentionally exclude `kitelev` (the author handle is legitimate
# in package.json, license, and commit metadata).

set -uo pipefail

PATTERNS='Андрей|T-Bank|ExoAssistant|@kitelev_bot'
SELF='scripts/check-privacy.sh'

if [ "${GITHUB_ACTIONS:-}" = "true" ]; then
  BASE="${GITHUB_BASE_REF:-main}"
  git fetch --no-tags --depth=1 origin "$BASE" 2>/dev/null || true
  FILES=$(git diff "origin/${BASE}...HEAD" --name-only --diff-filter=ACM 2>/dev/null || true)
else
  FILES=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null || true)
fi

if [ -z "$FILES" ]; then
  exit 0
fi

EXIT=0
while IFS= read -r FILE; do
  [ -z "$FILE" ] && continue
  [ -f "$FILE" ] || continue
  [ "$FILE" = "$SELF" ] && continue
  HITS=$(grep -nE "$PATTERNS" "$FILE" 2>/dev/null || true)
  if [ -n "$HITS" ]; then
    echo "::error file=${FILE}::Private marker(s) found:"
    while IFS= read -r LINE; do
      LINE_NO="${LINE%%:*}"
      echo "::error file=${FILE},line=${LINE_NO}::${LINE}"
    done <<< "$HITS"
    EXIT=1
  fi
done <<< "$FILES"

exit $EXIT
