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

# MAESTRO_ENGINE=cli runs flows with the official maestro CLI instead of
# maestro-runner. The runner's Android driver approximates Maestro's anchored
# regex text matching with UiSelector textContains, which mis-targets taps
# (e.g. 'Continue' resolves to the 'Continue to <app>' title instead of the
# button), so Android CI uses the CLI; iOS stays on the runner's wda driver.
if [ "${MAESTRO_ENGINE:-runner}" = "cli" ]; then
  command -v maestro >/dev/null 2>&1 || {
    echo "maestro is required: https://docs.maestro.dev"
    exit 1
  }
else
  command -v maestro-runner >/dev/null 2>&1 || {
    echo "maestro-runner is required: https://devicelab.dev/open-source/maestro-runner/docs/getting-started"
    exit 1
  }
fi

: "${CLERK_TEST_EMAIL:?CLERK_TEST_EMAIL is required}"
: "${CLERK_TEST_PASSWORD:?CLERK_TEST_PASSWORD is required}"

force_stop() { if [ "$#" -gt 0 ]; then "$@" >/dev/null 2>&1 || true; fi; }

run_flow() {
  local output_name=$1
  shift
  local output_root=${MAESTRO_DEBUG_OUTPUT:-${TMPDIR:-/tmp}/clerk-expo-maestro-runner}

  if [ "${MAESTRO_ENGINE:-runner}" = "cli" ]; then
    # The CLI's env flag is -e; translate the shared --env arguments.
    local args=() a
    for a in "$@"; do
      if [ "$a" = "--env" ]; then args+=("-e"); else args+=("$a"); fi
    done
    maestro test \
      --debug-output "$output_root/$output_name" \
      --flatten-debug-output \
      "${args[@]}"
  else
    maestro-runner test \
      --output "$output_root/$output_name" \
      --flatten \
      --artifacts on-failure \
      "$@"
  fi
}

record_result() {
  local flow=$1
  local result=$2
  local attempts=$3
  local duration=$4

  echo "Flow $flow: $result after $attempts attempt(s) in ${duration}s"
  if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
    printf '| `%s` | %s | %s | %ss |\n' "$flow" "$result" "$attempts" "$duration" >> "$GITHUB_STEP_SUMMARY"
  fi
}

if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  {
    echo '### Maestro flow timings'
    echo '| Flow | Result | Attempts | Duration |'
    echo '| --- | --- | ---: | ---: |'
  } >> "$GITHUB_STEP_SUMMARY"
fi

# Warm up the JS bundle and accessibility tree before running the flows.
warmup_started=$SECONDS
warmup_result=failed
for warmup_attempt in 1 2; do
  if run_flow "warmup-attempt-$warmup_attempt" flows/subflows/_warmup.yaml; then
    warmup_result=passed
    break
  fi
  force_stop "$@"
  if [ "$warmup_attempt" -eq 1 ]; then
    echo "::warning::Warmup failed attempt 1, retrying after 10s..."
    sleep 10
  fi
done
warmup_duration=$((SECONDS - warmup_started))
record_result "_warmup" "$warmup_result" "$warmup_attempt" "$warmup_duration"
if [ "$warmup_result" != passed ]; then
  echo "::error::Warmup failed after 2 attempts; aborting Maestro flows"
  exit 1
fi

# Force-stop so the first launchApp clearState doesn't race the warm process.
force_stop "$@"

# Every flows/*.yaml is a cross-platform test (platform differences live in
# per-step `when: platform:` conditionals); flows/subflows/ are runFlow-only.
status=0
for flow in flows/*.yaml; do
  [ -e "$flow" ] || continue
  flow_started=$SECONDS
  flow_result=failed
  for attempt in 1 2; do
    if run_flow "${flow##*/}-attempt-$attempt" \
      --env CLERK_TEST_EMAIL="$CLERK_TEST_EMAIL" \
      --env CLERK_TEST_PASSWORD="$CLERK_TEST_PASSWORD" \
      "$flow"; then
      flow_result=passed
      break
    fi
    if [ "$attempt" -eq 2 ]; then
      echo "::error::Flow $flow failed after 2 attempts"
      status=1
      force_stop "$@"
      break
    fi
    echo "::warning::Flow $flow failed attempt $attempt, retrying after 10s..."
    force_stop "$@"
    sleep 10
  done
  flow_duration=$((SECONDS - flow_started))
  record_result "$flow" "$flow_result" "$attempt" "$flow_duration"
done
exit $status
