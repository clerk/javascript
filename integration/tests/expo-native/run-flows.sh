#!/usr/bin/env bash
# Runs every top-level flow (flows/*.sh; flows/subflows/ are run_flow-only
# pieces) in its own agent-device session, so a hang or crash in one flow
# can't poison the rest, with one clean-state retry per flow. Whole-flow retry
# can mask app instability, so it is capped at a single retry purely to absorb
# emulator/simulator flake.
#
# Usage: ./run-flows.sh <ios|android>
#   CI iOS:     SIM_UDID=... ./run-flows.sh ios       (app installed by caller)
#   CI Android: ./run-android-flows.sh <apk>           (installs, then runs android)
#
# Required env: CLERK_TEST_EMAIL, CLERK_TEST_PASSWORD; SIM_UDID on ios
# Optional env: E2E_DEBUG_OUTPUT (directory for CI debug artifacts),
#               AGENT_DEVICE (binary, default: agent-device on PATH)
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

export PLATFORM=${1:?platform (ios|android) is required}
export AGENT_DEVICE=${AGENT_DEVICE:-agent-device}
export APP_ID=com.clerk.exponativebuildfixture
export FLOWS_DIR=$PWD/flows

command -v "$AGENT_DEVICE" >/dev/null 2>&1 || {
  echo "agent-device is required: https://github.com/callstack/agent-device"
  exit 1
}
: "${CLERK_TEST_EMAIL:?CLERK_TEST_EMAIL is required}"
: "${CLERK_TEST_PASSWORD:?CLERK_TEST_PASSWORD is required}"
if [ "$PLATFORM" = ios ]; then : "${SIM_UDID:?SIM_UDID is required on ios}"; fi

debug_root=${E2E_DEBUG_OUTPUT:-${TMPDIR:-/tmp}/clerk-expo-agent-device-runner}

with_lib() {
  (
    source ./lib.sh
    "$@"
  ) || true
}

# One attempt of one flow in a fresh session. Failure evidence goes to
# $debug_root/<name>/ before the session is closed.
run_flow_attempt() {
  local name=$1 flow=$2
  local out_dir=$debug_root/$name
  mkdir -p "$out_dir"
  export AD_SESSION=e2e-$name
  local rc=0
  (
    set -e
    source ./lib.sh
    echo "Flow $flow"
    source "$flow"
  ) 2>&1 | tee "$out_dir/steps.log" || rc=${PIPESTATUS[0]}
  if [ "$rc" -ne 0 ]; then
    with_lib ad_screenshot "$out_dir/failure.png"
    cp -R "$(with_lib ad_session_dir)" "$out_dir/session" 2>/dev/null || true
  fi
  with_lib ad_close
  return "$rc"
}

record_result() {
  local flow=$1 result=$2 attempts=$3 duration=$4
  echo "Flow $flow: $result after $attempts attempt(s) in ${duration}s"
  if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
    printf '| `%s` | %s | %s | %ss |\n' "$flow" "$result" "$attempts" "$duration" >> "$GITHUB_STEP_SUMMARY"
  fi
}

if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  {
    echo '### agent-device flow timings'
    echo '| Flow | Result | Attempts | Duration |'
    echo '| --- | --- | ---: | ---: |'
  } >> "$GITHUB_STEP_SUMMARY"
fi

# Warm up the JS bundle and accessibility tree before running the flows.
warmup_started=$SECONDS
warmup_result=failed
for warmup_attempt in 1 2; do
  if run_flow_attempt "warmup-attempt-$warmup_attempt" flows/subflows/_warmup.sh; then
    warmup_result=passed
    break
  fi
  with_lib force_stop
  if [ "$warmup_attempt" -eq 1 ]; then
    echo "::warning::Warmup failed attempt 1, retrying after 10s..."
    sleep 10
  fi
done
record_result "_warmup" "$warmup_result" "$warmup_attempt" "$((SECONDS - warmup_started))"
if [ "$warmup_result" != passed ]; then
  echo "::error::Warmup failed after 2 attempts; aborting flows"
  exit 1
fi

# Force-stop so the first clean-state launch doesn't race the warm process.
with_lib force_stop

# Every flows/*.sh is a cross-platform test (platform differences live in
# is_platform branches); flows/subflows/ are run_flow-only.
status=0
for flow in flows/*.sh; do
  [ -e "$flow" ] || continue
  flow_started=$SECONDS
  flow_result=failed
  for attempt in 1 2; do
    if run_flow_attempt "${flow##*/}-attempt-$attempt" "$flow"; then
      flow_result=passed
      break
    fi
    if [ "$attempt" -eq 2 ]; then
      echo "::error::Flow $flow failed after 2 attempts"
      status=1
      with_lib force_stop
      break
    fi
    echo "::warning::Flow $flow failed attempt $attempt, retrying after 10s..."
    with_lib force_stop
    sleep 10
  done
  record_result "$flow" "$flow_result" "$attempt" "$((SECONDS - flow_started))"
done
exit $status
