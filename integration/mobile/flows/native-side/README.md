# native-side flows (archived — not run by the Expo e2e suite)

These Maestro flows are **intentionally excluded** from the `@clerk/expo` e2e
run. The runners (`run-ios.sh`, `run-android.sh`, `run-regressions.sh`) and the
CI workflow (`.github/workflows/mobile-e2e.yml`) skip `flows/native-side/*` the
same way they skip `flows/common/*`.

## Why

The Expo e2e suite's job is the **bridge / integration layer** — the parts the
native SDKs can't see: config-plugin codegen (theming), native↔JS event
plumbing, view-factory mounting, and token-cache persistence.

The flows in here are primarily **exercising the native auth/profile UI** —
driving the sign-in form to completion, the sign-in→sign-out→sign-in cycle,
signing out from inside the native profile modal, the native OAuth button, and
opening the native profile modal. That behavior is owned and tested by the
native SDK suites (clerk-ios / clerk-android). Running them here duplicated that
coverage and was the main source of flakiness (they lean hardest on native UI
timing).

They're kept (not deleted) for reference and as a starting point if any of this
coverage needs to be ported to the native repos.

## What still runs in the Expo suite

- `smoke/cold-launch-no-flash` — bridge mounts the AuthView (no white flash)
- `theming/custom-theme-applied` + `theming/dark-mode-applied` — config plugin
  delivers the theme to the rendered native component
- `session/persists-across-restart` — token-cache (expo-secure-store) rehydrates
  the session across a cold restart (sign-in here is setup, not the assertion)
- `sign-in/get-help-loop-regression` — Android `<AuthView>` bridge nav regression
