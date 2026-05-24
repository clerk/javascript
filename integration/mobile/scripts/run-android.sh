#!/usr/bin/env bash
# Runs all non-manual Maestro flows on the Android emulator.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FLOWS_DIR="$SCRIPT_DIR/../flows"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib/filter-flows.sh"

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
ALL_FLOWS=()
while IFS= read -r f; do
  ALL_FLOWS+=("$f")
done < <(find "$FLOWS_DIR" -type f -name "*.yaml" ! -path "*/common/*")

# Maestro's --exclude-tags is a no-op when explicit file paths are passed,
# so pre-filter the list ourselves before handing it off.
KEEP=()
while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  KEEP+=("$f")
done < <(filter_flows "iosOnly,manual,skip" "${ALL_FLOWS[@]}")

if [[ ${#KEEP[@]} -eq 0 ]]; then
  echo "No flows to run after tag filtering." >&2
  exit 0
fi

maestro --platform android test \
  -e CLERK_TEST_EMAIL="${CLERK_TEST_EMAIL}" \
  -e CLERK_TEST_PASSWORD="${CLERK_TEST_PASSWORD}" \
  -e CLERK_TEST_EMAIL_SECONDARY="${CLERK_TEST_EMAIL_SECONDARY:-}" \
  -e CLERK_TEST_PASSWORD_SECONDARY="${CLERK_TEST_PASSWORD_SECONDARY:-}" \
  "$@" \
  "${KEEP[@]}"
