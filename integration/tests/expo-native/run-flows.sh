#!/usr/bin/env bash
# Runs every top-level Maestro flow (flows/*.yaml; flows/subflows/ are
# runFlow-only pieces) once across the connected devices, then reruns only the
# flows that failed. Whole-flow retry can mask app instability (the Maestro
# docs discourage it), so it is capped at a single rerun purely to absorb
# emulator/simulator flake.
#
# Usage: PLATFORM=<ios|android> ./run-flows.sh
#
# Required env: PLATFORM, CLERK_TEST_EMAIL, CLERK_TEST_PASSWORD
# Optional env: MAESTRO_UDID (comma-separated device ids; the flows are split
#               across them, one shard per device; unset lets maestro pick one),
#               MAESTRO_DEBUG_OUTPUT (directory for CI debug artifacts)
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

# Runs the official maestro CLI. maestro-runner was tried and reverted: its
# drivers mangle typed text and resolve text selectors by substring, so
# tapOn 'Continue' hits the 'Continue to <app>' title instead of the button.
command -v maestro >/dev/null 2>&1 || {
  echo "maestro is required: https://docs.maestro.dev"
  exit 1
}

: "${PLATFORM:?PLATFORM (ios|android) is required}"
: "${CLERK_TEST_EMAIL:?CLERK_TEST_EMAIL is required}"
: "${CLERK_TEST_PASSWORD:?CLERK_TEST_PASSWORD is required}"

app_id=com.clerk.exponativebuildfixture
output_root=${MAESTRO_DEBUG_OUTPUT:-${TMPDIR:-/tmp}/clerk-expo-maestro-runner}
IFS=, read -r -a devices <<< "${MAESTRO_UDID:-}"
device_count=${#devices[@]}
[ "$device_count" -gt 0 ] || device_count=1

force_stop() {
  local device
  for device in ${devices[@]+"${devices[@]}"}; do
    if [ "$PLATFORM" = ios ]; then
      xcrun simctl terminate "$device" "$app_id" >/dev/null 2>&1 || true
    else
      adb -s "$device" shell am force-stop "$app_id" >/dev/null 2>&1 || true
    fi
  done
}

# $1: output name, $2: shard mode (all|split), $3: shard count, rest: flows.
run_maestro() {
  local output_name=$1 mode=$2 shards=$3
  shift 3
  local shard_args=()
  if [ "$shards" -gt 1 ]; then shard_args=("--shard-$mode" "$shards"); fi
  maestro ${MAESTRO_UDID:+--udid "$MAESTRO_UDID"} test \
    ${shard_args[@]+"${shard_args[@]}"} \
    --debug-output "$output_root/$output_name" \
    --flatten-debug-output \
    --format JUNIT \
    --output "$output_root/$output_name/report.xml" \
    -e CLERK_TEST_EMAIL="$CLERK_TEST_EMAIL" \
    -e CLERK_TEST_PASSWORD="$CLERK_TEST_PASSWORD" \
    "$@"
}

# Prints one "<file>\t<status>\t<seconds>" line per testcase in a JUnit report.
report_rows() {
  python3 - "$1" <<'PY'
import sys, xml.etree.ElementTree as ET
for case in ET.parse(sys.argv[1]).getroot().iter('testcase'):
    print(f"{case.get('file')}\t{case.get('status')}\t{float(case.get('time') or 0):.0f}")
PY
}

started=$SECONDS
warmup_result=failed
for warmup_attempt in 1 2; do
  if run_maestro "warmup-attempt-$warmup_attempt" all "$device_count" flows/subflows/_warmup.yaml; then
    warmup_result=passed
    break
  fi
  force_stop
  if [ "$warmup_attempt" -eq 1 ]; then
    echo "::warning::Warmup failed attempt 1, retrying after 10s..."
    sleep 10
  fi
done
echo "Warmup: $warmup_result after $warmup_attempt attempt(s) in $((SECONDS - started))s"
if [ "$warmup_result" != passed ]; then
  echo "::error::Warmup failed after 2 attempts; aborting Maestro flows"
  exit 1
fi

# Force-stop so the first launchApp clearState doesn't race the warm process.
force_stop

run_maestro flows split "$device_count" flows/*.yaml || true
report_rows "$output_root/flows/report.xml" > "$output_root/attempt-1.tsv"

failed=()
while IFS=$'\t' read -r file status _; do
  [ "$status" = SUCCESS ] || failed+=("$file")
done < "$output_root/attempt-1.tsv"

if [ "${#failed[@]}" -gt 0 ]; then
  echo "::warning::${#failed[@]} flow(s) failed, rerunning after 10s: ${failed[*]}"
  force_stop
  sleep 10
  shards=$device_count
  [ "${#failed[@]}" -lt "$shards" ] && shards=${#failed[@]}
  run_maestro rerun split "$shards" "${failed[@]}" || true
  report_rows "$output_root/rerun/report.xml" > "$output_root/attempt-2.tsv"
fi

if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  {
    echo "### Maestro flow timings ($device_count device(s))"
    echo '| Flow | Result | Attempts | Duration |'
    echo '| --- | --- | ---: | ---: |'
  } >> "$GITHUB_STEP_SUMMARY"
fi

status=0
while IFS=$'\t' read -r file result seconds; do
  attempts=1
  if [ -f "$output_root/attempt-2.tsv" ]; then
    rerun=$(awk -F'\t' -v f="$file" '$1 == f { print $2 "\t" $3 }' "$output_root/attempt-2.tsv")
    if [ -n "$rerun" ]; then
      attempts=2
      IFS=$'\t' read -r result seconds <<< "$rerun"
    fi
  fi
  if [ "$result" = SUCCESS ]; then result=passed; else result=failed; status=1; fi
  echo "Flow $file: $result after $attempts attempt(s) in ${seconds}s"
  if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
    printf '| `%s` | %s | %s | %ss |\n' "$file" "$result" "$attempts" "$seconds" >> "$GITHUB_STEP_SUMMARY"
  fi
done < "$output_root/attempt-1.tsv"
exit $status
