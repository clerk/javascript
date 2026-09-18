#!/usr/bin/env bash
# Usage: ./run-android-flows.sh <apk>   (inside reactivecircus/android-emulator-runner)
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

apk_path=${1:?APK path is required}
command -v adb >/dev/null 2>&1 || {
  echo 'adb is required'
  exit 1
}

shards=${MAESTRO_SHARDS:-1}
devices=(emulator-5554)
sdk=$(dirname "$(dirname "$(command -v adb)")")
debug=${MAESTRO_DEBUG_OUTPUT:-${TMPDIR:-/tmp}/clerk-expo-maestro-runner}
mkdir -p "$debug"

for ((i = 1; i < shards; i++)); do
  port=$((5554 + i * 2))
  "$sdk/emulator/emulator" -avd "${AVD_NAME:-test}" -read-only -port "$port" \
    -no-window -gpu swiftshader_indirect -noaudio -no-boot-anim -no-snapshot-save \
    > "$debug/emulator-$port.log" 2>&1 &
  devices+=("emulator-$port")
done

# adb wait-for-device never returns for an emulator that died at startup
wait_for_boot() {
  local device=$1 elapsed=0
  until [ "$(adb -s "$device" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = 1 ]; do
    if [ "$elapsed" -ge 240 ]; then
      echo "::error::$device did not boot within ${elapsed}s"
      [ -f "$debug/$device.log" ] && tail -n 40 "$debug/$device.log"
      return 1
    fi
    sleep 5
    elapsed=$((elapsed + 5))
  done
  echo "$device booted"
}
for device in "${devices[@]}"; do
  wait_for_boot "$device"
  adb -s "$device" install -r "$apk_path"
done

logcat_pids=()
stop_logcat() {
  local pid
  for pid in ${logcat_pids[@]+"${logcat_pids[@]}"}; do
    kill "$pid" >/dev/null 2>&1 || true
    wait "$pid" 2>/dev/null || true
  done
}
trap stop_logcat EXIT

for device in "${devices[@]}"; do
  adb -s "$device" logcat -c || true
  adb -s "$device" logcat -v threadtime > "$debug/$device-logcat.log" 2>&1 &
  logcat_pids+=($!)
done

PLATFORM=android MAESTRO_UDID=$(IFS=,; echo "${devices[*]}") ./run-flows.sh
