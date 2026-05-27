#!/usr/bin/env bash
# Runs all non-manual Maestro flows on the iOS simulator.
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

echo "==> Running all non-manual flows on iOS..."
# Collect every flow file under flows/, excluding the common/ subflow dir.
# Use while-read to stay compatible with macOS bash 3.2 (no mapfile).
ALL_FLOWS=()
while IFS= read -r f; do
  ALL_FLOWS+=("$f")
done < <(find "$FLOWS_DIR" -type f -name "*.yaml" ! -path "*/common/*" ! -path "*/native-side/*")

# Maestro's --exclude-tags is a no-op when explicit file paths are passed,
# so pre-filter the list ourselves before handing it off. See
# scripts/lib/filter-flows.sh for the why.
KEEP=()
while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  KEEP+=("$f")
done < <(filter_flows "androidOnly,manual,skip" "${ALL_FLOWS[@]}")

if [[ ${#KEEP[@]} -eq 0 ]]; then
  echo "No flows to run after tag filtering." >&2
  exit 0
fi

# Run maestro from integration/mobile so `takeScreenshot` files (theme-*.png)
# land in a known place for the theme post-step below. KEEP[] are absolute
# paths and subflows resolve relative to their flow file, so the cd is safe.
cd "$FLOWS_DIR/.."

set +e
maestro --platform ios test \
  -e CLERK_TEST_EMAIL="${CLERK_TEST_EMAIL}" \
  -e CLERK_TEST_PASSWORD="${CLERK_TEST_PASSWORD}" \
  -e CLERK_TEST_EMAIL_SECONDARY="${CLERK_TEST_EMAIL_SECONDARY:-}" \
  -e CLERK_TEST_PASSWORD_SECONDARY="${CLERK_TEST_PASSWORD_SECONDARY:-}" \
  "$@" \
  "${KEEP[@]}"
maestro_rc=$?
set -e

# Verify theming on whatever screenshots the theming flows captured (Node
# post-step; Maestro can't decode PNGs). A theme regression fails the run.
"$SCRIPT_DIR/verify-themes.sh" || maestro_rc=1

exit "$maestro_rc"
