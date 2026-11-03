#!/usr/bin/env bash
set -euo pipefail

IFS=, read -r -a udids <<< "${CLERK_TEST_DEVICES:?CLERK_TEST_DEVICES is required}"
for udid in "${udids[@]}"; do
  xcrun simctl spawn "$udid" defaults write com.apple.UIKit UIAnimationDragCoefficient -float 0.01 || true
  xcrun simctl spawn "$udid" defaults write -g ApplePersistenceIgnoreState -bool YES || true
  xcrun simctl spawn "$udid" defaults write com.apple.keyboard.ContinuousPath -bool NO || true
  xcrun simctl spawn "$udid" defaults write com.apple.keyboard.AutoCapitalization -bool NO || true
  xcrun simctl spawn "$udid" defaults write com.apple.keyboard.AutoCorrection -bool NO || true
  xcrun simctl spawn "$udid" defaults write com.apple.keyboard.Prediction -bool NO || true
  # the keyboard tutorial sheets have their own Continue button that steals taps
  for key in DidShowContinuousPathIntroduction DidShowGestureKeyboardIntroduction KeyboardDidShowProductivityTutorial UIKeyboardDidShowInternationalInfoIntroduction; do
    xcrun simctl spawn "$udid" defaults write com.apple.keyboard.preferences "$key" -bool YES || true
  done
done
