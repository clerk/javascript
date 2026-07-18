#!/usr/bin/env bash
# Runs every top-level Maestro flow (flows/*.yaml; flows/subflows/ are
# runFlow-only pieces) as one CLI invocation per flow, so a hang or crash in
# one flow can't poison the rest, with one clean-state retry per flow.
# Whole-flow retry can mask app instability (the Maestro docs discourage it),
# so it is capped at a single retry purely to absorb emulator/simulator flake.
#
# Usage: ./run-flows.sh [force-stop command...]
#   CI iOS:     ./run-flows.sh xcrun simctl terminate "$SIM_UDID" com.clerk.exponativebuildfixture
#   CI Android: ./run-flows.sh adb shell am force-stop com.clerk.exponativebuildfixture
#   Local:      ./run-flows.sh
#
# Required env: CLERK_TEST_EMAIL, CLERK_TEST_PASSWORD
# Optional env: MAESTRO_DEBUG_OUTPUT (directory for CI debug artifacts)
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

command -v maestro >/dev/null 2>&1 || {
  echo "maestro CLI is required: https://docs.maestro.dev/getting-started/installing-maestro"
  exit 1
}

: "${CLERK_TEST_EMAIL:?CLERK_TEST_EMAIL is required}"
: "${CLERK_TEST_PASSWORD:?CLERK_TEST_PASSWORD is required}"

force_stop() { if [ "$#" -gt 0 ]; then "$@" >/dev/null 2>&1 || true; fi; }

debug_args=()
if [ -n "${MAESTRO_DEBUG_OUTPUT:-}" ]; then
  debug_args=(--debug-output "$MAESTRO_DEBUG_OUTPUT" --flatten-debug-output)
fi

# Warmup: parse the JS bundle + populate the a11y tree once so the first real
# flow doesn't flake on cold-start; force-stop afterwards so the first
# launchApp clearState doesn't race a still-foregrounded app process.
maestro test ${debug_args+"${debug_args[@]}"} flows/subflows/_warmup.yaml || true
force_stop "$@"

# Every flows/*.yaml is a cross-platform test (platform differences live in
# per-step `when: platform:` conditionals); flows/subflows/ are runFlow-only.
status=0
for flow in flows/*.yaml; do
  [ -e "$flow" ] || continue
  for attempt in 1 2; do
    if maestro test \
      --env CLERK_TEST_EMAIL="$CLERK_TEST_EMAIL" \
      --env CLERK_TEST_PASSWORD="$CLERK_TEST_PASSWORD" \
      ${debug_args+"${debug_args[@]}"} \
      "$flow"; then
      break
    fi
    if [ "$attempt" -eq 2 ]; then
      echo "::error::Flow $flow failed after 2 attempts"
      status=1
      break
    fi
    echo "::warning::Flow $flow failed attempt $attempt, retrying after 10s..."
    force_stop "$@"
    sleep 10
  done
done
exit $status
