#!/usr/bin/env bash
# Post-Maestro theme verification.
#
# Maestro's runScript sandbox (GraalJS) can't decode a PNG, so the theming
# flows only CAPTURE screenshots (theme-light.png / theme-dark.png, written to
# integration/mobile/ — maestro's cwd). This script runs the Node color check
# on whichever of those screenshots were produced. It is safe to call
# unconditionally: a missing screenshot (theming flow excluded or not run) is
# skipped, not failed. Exit non-zero only if a produced screenshot fails its
# color assertion.
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)" # integration/mobile = maestro's cwd

# Ensure the PNG decoder the checker needs is installed.
if [ ! -d "$SCRIPT_DIR/node_modules/pngjs" ]; then
  ( cd "$SCRIPT_DIR" && npm install --no-audit --no-fund --silent )
fi

rc=0
check() { # <screenshot-file> <expected-hex>
  local img="$MOBILE_DIR/$1" expected="$2"
  if [ -f "$img" ]; then
    echo "==> theme check: $1 expects $expected"
    node "$SCRIPT_DIR/check-theme-color.js" \
      --image="$img" --expected="$expected" --min-pixels=8000 --tolerance=24 || rc=1
  else
    echo "==> theme check: $1 not produced (theming flow not run) — skipping"
  fi
}

# Light theme runs on both platforms; dark theme is Android-only (see the
# theming flows' tags). Each expected color comes from clerk-theme.json.
check theme-light.png "#FF4444"
check theme-dark.png "#FF6666"

exit "$rc"
