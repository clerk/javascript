#!/usr/bin/env bash
# Runs all non-manual Maestro flows on the iOS simulator.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FLOWS_DIR="$SCRIPT_DIR/../flows"

if [[ -f "$SCRIPT_DIR/../config/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$SCRIPT_DIR/../config/.env"
  set +a
fi

if ! command -v maestro >/dev/null 2>&1; then
  echo "Maestro not found. Run ./scripts/install-maestro.sh first." >&2
  exit 1
fi

echo "==> Running all non-manual flows on iOS..."
maestro test \
  --exclude-tags androidOnly,manual,skip \
  "$@" \
  "$FLOWS_DIR"
