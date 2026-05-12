#!/usr/bin/env bash
# Runs all non-manual Maestro flows on the Android emulator.
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

echo "==> Running all non-manual flows on Android..."
# Maestro does not auto-recurse into subdirectories. Pass each flow file
# explicitly to pick up flows/sign-in/, flows/profile/, etc. Skip the
# flows/common/ directory — those are subflows invoked via runFlow.
# Use while-read to stay compatible with macOS bash 3.2 (no mapfile).
FLOW_FILES=()
while IFS= read -r f; do
  FLOW_FILES+=("$f")
done < <(find "$FLOWS_DIR" -type f -name "*.yaml" ! -path "*/common/*")

maestro --platform android test \
  --exclude-tags iosOnly,manual,skip \
  -e CLERK_TEST_EMAIL="${CLERK_TEST_EMAIL}" \
  -e CLERK_TEST_PASSWORD="${CLERK_TEST_PASSWORD}" \
  -e CLERK_TEST_EMAIL_SECONDARY="${CLERK_TEST_EMAIL_SECONDARY:-}" \
  -e CLERK_TEST_PASSWORD_SECONDARY="${CLERK_TEST_PASSWORD_SECONDARY:-}" \
  "$@" \
  "${FLOW_FILES[@]}"
