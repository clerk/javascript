# Expo native E2E

Drives the `integration/templates/expo-native` fixture on an iOS simulator and
an Android emulator with [agent-device](https://github.com/callstack/agent-device).

- `flows/*.sh` are the cross-platform tests, one per scenario.
- `flows/subflows/*.sh` are `run_flow`-only pieces shared by the tests.
- `lib.sh` is the verb table. Each function maps one step (`tap_on_id`,
  `wait_visible_text`, `input_text`, ...) to one agent-device command, so a
  flow reads as a list of steps and platform differences live in
  `is_platform` branches.
- `run-flows.sh` runs a warmup launch, then every flow in its own session with
  one clean-state retry, and writes a timing table to the job summary.
  `run-android-flows.sh` installs the APK and captures logcat first.

## Selectors

Selectors use English text and labels because clerk-android ships no test
tags and both native SDKs localize every string, so devices must run the `en`
locale. clerk-ios accessibility identifiers such as `clerk.dismissButton` only
appear inside iOS-only branches. `text=` and `label=` match exactly, so
tapping `Continue` never hits the `Continue to <app>` title. Fixture testIDs
(`auth-state`, `open-auth-view-button`, ...) are matched with `id=`.

Clean state is `settings clear-app-state` plus, on iOS, a simulator keychain
reset, because clerk-ios keeps device state in the keychain and agent-device
only clears the data container.

## Run locally

Build the fixture the way the workflow does and install it on a booted
simulator or emulator, then:

    export CLERK_TEST_EMAIL=... CLERK_TEST_PASSWORD=...
    SIM_UDID=<udid> ./run-flows.sh ios
    ./run-android-flows.sh <path-to-app-release.apk>

`AGENT_DEVICE=<path>` points at a specific binary. `E2E_DEBUG_OUTPUT=<dir>`
keeps a step log per attempt plus a failure screenshot and the agent-device
session state for attempts that failed.
