#!/usr/bin/env bash
# Boots N simulators of one model on the newest installed iOS runtime and
# configures each for Maestro. `boot` returns as soon as the boots are issued
# so they overlap the native build; `wait` blocks until every one is usable.
#
# Usage: ./boot-ios-simulators.sh boot <count> [model]   # exports MAESTRO_UDID
#        ./boot-ios-simulators.sh wait                    # reads MAESTRO_UDID
set -euo pipefail

boot() {
  local count=$1 model=${2:-iPhone 17 Pro}
  local runtime device_type udids=() i
  # The runtime matching the SDK the app was built with, so a newer beta
  # runtime installed on the runner does not change the OS under test.
  sdk=$(xcrun --sdk iphonesimulator --show-sdk-version)
  runtime=$(xcrun simctl list runtimes available -j | jq -r --arg v "$sdk" \
    '[.runtimes[] | select(.platform == "iOS")] | (map(select(.version == $v)) + .) | first | .identifier')
  device_type=$(xcrun simctl list devicetypes -j | jq -r --arg m "$model" '.devicetypes[] | select(.name == $m) | .identifier')
  for i in $(seq 1 "$count"); do
    udids+=("$(xcrun simctl create "$model $i" "$device_type" "$runtime")")
    xcrun simctl boot "${udids[$((i - 1))]}"
  done
  MAESTRO_UDID=$(IFS=,; echo "${udids[*]}")
  echo "Booting $count x $model on $runtime: $MAESTRO_UDID"
  if [ -n "${GITHUB_ENV:-}" ]; then echo "MAESTRO_UDID=$MAESTRO_UDID" >> "$GITHUB_ENV"; fi
}

wait_ready() {
  local udid key
  IFS=, read -r -a udids <<< "${MAESTRO_UDID:?MAESTRO_UDID is required}"
  for udid in "${udids[@]}"; do
    xcrun simctl bootstatus "$udid" -b
    # Kill animations + predictive keyboard: animations add latency to every
    # tap; predictive text hijacks inputText targets.
    xcrun simctl spawn "$udid" defaults write com.apple.UIKit UIAnimationDragCoefficient -float 0.01 || true
    xcrun simctl spawn "$udid" defaults write -g ApplePersistenceIgnoreState -bool YES || true
    xcrun simctl spawn "$udid" defaults write com.apple.keyboard.ContinuousPath -bool NO || true
    xcrun simctl spawn "$udid" defaults write com.apple.keyboard.AutoCapitalization -bool NO || true
    xcrun simctl spawn "$udid" defaults write com.apple.keyboard.AutoCorrection -bool NO || true
    xcrun simctl spawn "$udid" defaults write com.apple.keyboard.Prediction -bool NO || true
    # The one-time keyboard tutorial sheets carry their own Continue button,
    # which can hijack taps on the AuthView's Continue.
    for key in DidShowContinuousPathIntroduction DidShowGestureKeyboardIntroduction KeyboardDidShowProductivityTutorial UIKeyboardDidShowInternationalInfoIntroduction; do
      xcrun simctl spawn "$udid" defaults write com.apple.keyboard.preferences "$key" -bool YES || true
    done
  done
}

case "${1:-}" in
  boot) boot "${2:?count is required}" "${3:-}" ;;
  wait) wait_ready ;;
  *) echo "usage: $0 boot <count> [model] | wait" >&2; exit 2 ;;
esac
