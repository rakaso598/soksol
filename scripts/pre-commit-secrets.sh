#!/usr/bin/env bash
# Grep staged files for common secret patterns. Exit non-zero if any found.
set -euo pipefail
PATTERNS=(
  "AKIA[A-Z0-9]{16}"
  "(?i:aws_secret)"
  "(?i:secret_key)"
  "(?i:private[_- ]?key)"
  "-----BEGIN (RSA|PRIVATE) KEY-----"
  "(?i:api[_- ]?key)"
  "(?i:client[_- ]?secret)"
  "(?i:token)"
  "(?i:password)"
)
# Collect staged files (name only)
FILES=$(git diff --cached --name-only --diff-filter=ACM || true)
if [ -z "$FILES" ]; then
  exit 0
fi
FOUND=0
for f in $FILES; do
  # skip binary files
  if git check-attr --all -- $f 2>/dev/null | grep -qi "binary"; then
    continue
  fi
  for p in "${PATTERNS[@]}"; do
    if git show :"$f" 2>/dev/null | grep -E --label="$f" -n --color=never -I "$p" >/dev/null 2>&1; then
      echo "Potential secret found in staged file: $f (pattern: $p)"
      git show :"$f" | grep -n --label="$f" -E "$p" || true
      FOUND=1
    fi
  done
done
if [ "$FOUND" -ne 0 ]; then
  echo "ERROR: One or more staged files contain possible secrets. Remove them or add to .gitignore before committing."
  exit 1
fi
exit 0
