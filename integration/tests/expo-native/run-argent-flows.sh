#!/usr/bin/env bash
# Runs every top-level Argent flow (.argent/flows/*.yaml; subflows/ are
# run:-only pieces) as one `argent flow run` invocation per flow, so a hang
# or crash in one flow can't poison the rest, with one clean-state retry per
# flow to absorb emulator/simulator flake.
#
# Argent's `launch:` restarts the app process but never clears its data, so
# the clean state the flows assume is produced here between flows:
#   ios:     terminate + uninstall + keychain reset + reinstall (Clerk device
#            state lives in the keychain and survives a plain reinstall)
#   android: force-stop + pm clear
#
# Usage: ./run-argent-flows.sh ios <sim-udid> <path-to-.app>
#        ./run-argent-flows.sh android <adb-serial>   (APK installed by caller)
#
# Required env: ARGENT_SECRET_CLERK_TEST_EMAIL, ARGENT_SECRET_CLERK_TEST_PASSWORD
#               (flows reference them as {{secret:...}}; Argent redacts values)
# Optional env: E2E_DEBUG_OUTPUT (directory for CI debug artifacts)
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

APP_ID=com.clerk.exponativebuildfixture
PLATFORM=${1:?platform (ios|android) is required}
DEVICE=${2:?device id is required}
APP_ARTIFACT=${3:-}

command -v argent >/dev/null 2>&1 || {
  echo "argent is required: https://github.com/software-mansion/argent"
  exit 1
}

: "${ARGENT_SECRET_CLERK_TEST_EMAIL:?ARGENT_SECRET_CLERK_TEST_EMAIL is required}"
: "${ARGENT_SECRET_CLERK_TEST_PASSWORD:?ARGENT_SECRET_CLERK_TEST_PASSWORD is required}"
if [ "$PLATFORM" = ios ]; then
  : "${APP_ARTIFACT:?path to the built .app is required on ios}"
fi

output_root=${E2E_DEBUG_OUTPUT:-${TMPDIR:-/tmp}/clerk-expo-argent-runner}

# Secrets are resolved by the resident tool-server, not the CLI, so a server
# started before ARGENT_SECRET_* was exported can't see them. Restart it here
# so the first flow boots a server that inherits this environment.
argent server stop >/dev/null 2>&1 || true

reset_state() {
  if [ "$PLATFORM" = ios ]; then
    xcrun simctl terminate "$DEVICE" "$APP_ID" >/dev/null 2>&1 || true
    xcrun simctl uninstall "$DEVICE" "$APP_ID" >/dev/null 2>&1 || true
    xcrun simctl keychain "$DEVICE" reset >/dev/null 2>&1 || true
    xcrun simctl install "$DEVICE" "$APP_ARTIFACT"
  else
    adb -s "$DEVICE" shell am force-stop "$APP_ID" >/dev/null 2>&1 || true
    adb -s "$DEVICE" shell pm clear "$APP_ID" >/dev/null 2>&1 || true
  fi
}

# argent's --output only exports failed snapshot-step images, so the step
# report and a device screenshot on failure are captured here for parity
# with the old Maestro debug artifacts.
run_flow() {
  local output_name=$1
  local flow=$2
  mkdir -p "$output_root/$output_name"
  argent flow run "$flow" --device "$DEVICE" --output "$output_root/$output_name" 2>&1 \
    | tee "$output_root/$output_name/report.log"
  local rc=${PIPESTATUS[0]}
  if [ "$rc" -ne 0 ]; then
    if [ "$PLATFORM" = ios ]; then
      xcrun simctl io "$DEVICE" screenshot "$output_root/$output_name/failure.png" >/dev/null 2>&1 || true
    else
      adb -s "$DEVICE" exec-out screencap -p > "$output_root/$output_name/failure.png" 2>/dev/null || true
    fi
  fi
  return "$rc"
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
    echo '### Argent flow timings'
    echo '| Flow | Result | Attempts | Duration |'
    echo '| --- | --- | ---: | ---: |'
  } >> "$GITHUB_STEP_SUMMARY"
fi

# Warm up the JS bundle and accessibility tree before running the flows.
warmup_started=$SECONDS
warmup_result=failed
for warmup_attempt in 1 2; do
  reset_state
  if run_flow "warmup-attempt-$warmup_attempt" .argent/flows/subflows/_warmup.yaml; then
    warmup_result=passed
    break
  fi
  if [ "$warmup_attempt" -eq 1 ]; then
    echo "::warning::Warmup failed attempt 1, retrying after 10s..."
    sleep 10
  fi
done
warmup_duration=$((SECONDS - warmup_started))
record_result "_warmup" "$warmup_result" "$warmup_attempt" "$warmup_duration"
if [ "$warmup_result" != passed ]; then
  echo "::error::Warmup failed after 2 attempts; aborting Argent flows"
  exit 1
fi

# Every .argent/flows/*.yaml is a cross-platform test (platform differences
# live in per-step `when: { platform: ... }` blocks); subflows/ are run:-only.
status=0
for flow in .argent/flows/*.yaml; do
  [ -e "$flow" ] || continue
  flow_name=${flow##*/}
  flow_started=$SECONDS
  flow_result=failed
  for attempt in 1 2; do
    reset_state
    if run_flow "$flow_name-attempt-$attempt" "$flow"; then
      flow_result=passed
      break
    fi
    if [ "$attempt" -eq 2 ]; then
      echo "::error::Flow $flow failed after 2 attempts"
      status=1
      break
    fi
    echo "::warning::Flow $flow failed attempt $attempt, retrying after 10s..."
    sleep 10
  done
  flow_duration=$((SECONDS - flow_started))
  record_result "$flow" "$flow_result" "$attempt" "$flow_duration"
done
exit $status
