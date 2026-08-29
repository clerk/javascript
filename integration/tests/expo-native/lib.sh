#!/usr/bin/env bash
# Verb table: one function per Maestro verb the flows used, each a single
# agent-device call, so a flow file reads like the YAML it replaced.
# Sourced by run-flows.sh with PLATFORM, AD_SESSION, and APP_ID set; flows
# never call agent-device directly.

: "${AGENT_DEVICE:=agent-device}"
: "${PLATFORM:?PLATFORM (ios|android) is required}"
: "${AD_SESSION:?AD_SESSION is required}"
: "${APP_ID:=com.clerk.exponativebuildfixture}"
: "${FLOWS_DIR:=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/flows}"

is_platform() { [ "$PLATFORM" = "$1" ]; }

ad() {
  local target=()
  if is_platform ios && [ -n "${SIM_UDID:-}" ]; then target=(--udid "$SIM_UDID"); fi
  "$AGENT_DEVICE" "$@" --session "$AD_SESSION" --platform "$PLATFORM" "${target[@]}"
}

# Runs a command, keeps its output in AD_OUT, and prints it so CI logs carry
# the hints and settle diffs agent-device emits.
ad_run() {
  local rc=0
  AD_OUT=$(ad "$@" 2>&1) || rc=$?
  printf '%s\n' "$AD_OUT"
  return $rc
}

# wait/is reject a selector that matches two elements; a second match still
# proves the text is on screen, which is all a visibility check needs.
ad_visible() {
  local rc=0
  AD_OUT=$(ad "$@" 2>&1) || rc=$?
  if [ $rc -ne 0 ] && [[ $AD_OUT == *AMBIGUOUS_MATCH* ]]; then rc=0; fi
  [ $rc -eq 0 ] || printf '%s\n' "$AD_OUT"
  return $rc
}

step() { echo "  - $*"; }

selector_text() {
  local sel="" alt
  for alt in "$@"; do sel+="${sel:+ || }text=\"$alt\""; done
  printf '%s' "$sel"
}

force_stop() {
  if is_platform ios; then
    xcrun simctl terminate "${SIM_UDID:-booted}" "$APP_ID" >/dev/null 2>&1 || true
  else
    adb shell am force-stop "$APP_ID" >/dev/null 2>&1 || true
  fi
}

# launchApp; --clear-state is Maestro's clearState + clearKeychain. agent-device
# clears the data container but never the iOS keychain, where clerk-ios keeps
# device state, so the keychain is reset here.
launch_app() {
  if [ "${1:-}" = "--clear-state" ]; then
    step "launchApp clearState clearKeychain"
    force_stop
    ad_run settings clear-app-state "$APP_ID" >/dev/null
    if is_platform ios; then xcrun simctl keychain "${SIM_UDID:-booted}" reset; fi
  else
    step "launchApp"
  fi
  ad_run open "$APP_ID" --relaunch >/dev/null
}

stop_app() {
  step "stopApp"
  force_stop
}

tap_on_id() {
  step "tapOn id=$1"
  ad_run press "id=\"$1\"" >/dev/null
}
tap_on_text() {
  step "tapOn text=$*"
  ad_run press "$(selector_text "$@")" >/dev/null
}
tap_on_button_text() {
  step "tapOn button text=$*"
  ad_run press "role=button $(selector_text "$@")" >/dev/null
}

# inputText: fill replaces the field value, so Maestro's eraseText has no
# counterpart. The value is never echoed.
input_text() {
  step "inputText into $1"
  ad fill "$1" "$2" >/dev/null 2>&1
}

wait_visible_id() {
  step "extendedWaitUntil id=$1 (${2}ms)"
  ad_visible wait "id=\"$1\"" "$2"
}
wait_visible_text() {
  local ms=$1
  shift
  step "extendedWaitUntil text=$* (${ms}ms)"
  ad_visible wait "$(selector_text "$@")" "$ms"
}
wait_visible_substring() {
  step "extendedWaitUntil substring=$2 (${1}ms)"
  ad_run find text "$2" wait "$1" >/dev/null
}

assert_visible_id() {
  step "assertVisible id=$1"
  ad_visible is exists "id=\"$1\""
}
assert_visible_text() {
  step "assertVisible text=$*"
  ad_visible is exists "$(selector_text "$@")"
}

is_visible_text() { ad_visible is exists "$(selector_text "$@")" >/dev/null 2>&1; }
is_visible_substring() { [[ $(ad find text "$1" exists 2>/dev/null) == *"Found: true"* ]]; }

# waitForAnimationToEnd never fails a Maestro flow; wait stable times out on
# screens that keep animating, so the timeout is swallowed here too.
wait_for_animation_to_end() {
  step "waitForAnimationToEnd (${1}ms)"
  ad wait stable 500 "$1" >/dev/null 2>&1 || true
}

back_system() {
  step "back"
  ad_run back --system >/dev/null
}

run_flow() {
  step "runFlow $1"
  source "$FLOWS_DIR/$1"
}

# Maestro retry: maxRetries=N means up to N more attempts after the first.
retry() {
  local max=$1 fn=$2 attempt
  for attempt in $(seq 0 "$max"); do
    if (
      set -e
      "$fn"
    ); then return 0; fi
    [ "$attempt" -lt "$max" ] && step "retry $fn (attempt $((attempt + 1)) failed)"
  done
  return 1
}

ad_screenshot() { ad screenshot "$1" >/dev/null 2>&1 || true; }
ad_close() { ad close >/dev/null 2>&1 || true; }
ad_session_dir() { printf '%s/sessions/%s' "$("$AGENT_DEVICE" session state-dir 2>/dev/null)" "$AD_SESSION"; }

# Text fields: placeholder is not a selector key, so fields are targeted by
# the role and identifier each platform exposes once the field is focused.
if is_platform ios; then
  IDENTIFIER_FIELD='role=textfield id="clerk.auth.start.identifier"'
  PASSWORD_FIELD='role=securetextfield id="clerk.auth.signIn.password"'
  CODE_FIELD='role=textfield'
else
  IDENTIFIER_FIELD='role=edittext'
  PASSWORD_FIELD='role=edittext'
  CODE_FIELD='role=edittext'
fi
