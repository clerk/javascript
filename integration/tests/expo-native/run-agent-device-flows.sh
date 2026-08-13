#!/usr/bin/env bash
# Runs the Maestro-format flows through agent-device's Maestro engine
# (`agent-device test --maestro`): one suite invocation for all top-level
# flows/*.yaml, one retry per flow via --retries, per-attempt artifacts
# under --artifacts-dir. flows/subflows/ stay runFlow-only (the glob does
# not match them).
#
# The engine supports launchApp.clearState but not clearKeychain, so the
# Clerk device state persisted in the iOS simulator keychain is reset once
# up front here instead.
#
# Usage: ./run-agent-device-flows.sh ios <device-name>     (app installed by caller)
#        ./run-agent-device-flows.sh android               (APK installed by caller)
#
# Required env: CLERK_TEST_EMAIL, CLERK_TEST_PASSWORD
# Optional env: E2E_DEBUG_OUTPUT (directory for CI debug artifacts),
#               SIM_UDID (iOS keychain reset target; defaults to "booted")
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

PLATFORM=${1:?platform (ios|android) is required}
DEVICE=${2:-}

command -v agent-device >/dev/null 2>&1 || {
  echo "agent-device is required: https://github.com/callstack/agent-device"
  exit 1
}

: "${CLERK_TEST_EMAIL:?CLERK_TEST_EMAIL is required}"
: "${CLERK_TEST_PASSWORD:?CLERK_TEST_PASSWORD is required}"

artifacts_root=${E2E_DEBUG_OUTPUT:-${TMPDIR:-/tmp}/clerk-expo-agent-device-runner}

if [ "$PLATFORM" = ios ]; then
  : "${DEVICE:?iOS device name is required}"
  xcrun simctl keychain "${SIM_UDID:-booted}" reset || true
  device_args=(--device "$DEVICE")
else
  device_args=()
fi

agent-device test 'flows/*.yaml' --maestro \
  --platform "$PLATFORM" \
  "${device_args[@]}" \
  --retries 1 \
  --artifacts-dir "$artifacts_root/suite" \
  --reporter default \
  -e CLERK_TEST_EMAIL="$CLERK_TEST_EMAIL" \
  -e CLERK_TEST_PASSWORD="$CLERK_TEST_PASSWORD"
