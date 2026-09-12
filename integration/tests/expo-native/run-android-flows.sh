#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

apk_path=${1:?APK path is required}
command -v adb >/dev/null 2>&1 || {
  echo 'adb is required'
  exit 1
}

adb install -r "$apk_path"

logcat_pid=
stop_logcat() {
  [ -n "$logcat_pid" ] || return 0
  kill "$logcat_pid" >/dev/null 2>&1 || true
  wait "$logcat_pid" 2>/dev/null || true
}
trap stop_logcat EXIT

if [ -n "${MAESTRO_DEBUG_OUTPUT:-}" ]; then
  mkdir -p "$MAESTRO_DEBUG_OUTPUT"
  adb logcat -c || true
  adb logcat -v threadtime > "$MAESTRO_DEBUG_OUTPUT/android-logcat.log" 2>&1 &
  logcat_pid=$!
fi

./run-flows.sh adb shell am force-stop com.clerk.exponativebuildfixture
