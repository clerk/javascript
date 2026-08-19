# Testing @clerk/expo: unit, native, and e2e

## Unit tests (vitest)

- `pnpm --filter @clerk/expo test` (after a full `pnpm build`; see the clerk-monorepo skill for
  the general loop). Single file: `pnpm --filter @clerk/expo test <filename substring>`.
- Config: `vitest.config.mts` (`environment: jsdom`), setup in `vitest.setup.mts` which stubs
  `globalThis.expo = { EventEmitter }` for expo-modules-core, sets `PACKAGE_NAME` /
  `PACKAGE_VERSION` globals and `__DEV__ = false`. There is no react-native preset; native and
  expo modules are mocked **per test file**.
- What the suite actually covers: the sync state machine
  (`src/provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` and
  `nativeClientSyncCoordinator.test.ts`), the singleton
  (`createClerkInstance.test.ts`), spec contract checks (`src/specs/__tests__/`), native-module
  resolution (`src/utils/__tests__/native-module.test.ts`), and the config plugin
  (`src/__tests__/appPlugin.*.test.js`, which import `app.plugin.js`'s `_testing` export).
- What it cannot cover: anything that actually executes Swift/Kotlin, prebuild output, or real
  device-token storage. Green vitest says nothing about the native layer.

## Native unit tests (not in CI)

- iOS: `ios/Tests/*.swift`, declared as a podspec `test_spec 'Tests'`.
- Android: `android/src/test/java/expo/modules/clerk/*.kt` (JUnit).
- **No workflow runs either suite.** Touching bridge logic means running them manually (via a
  consuming app's workspace for iOS, `gradlew test` for Android) and saying so in the PR; do not
  imply CI covered them.

## E2E: the expo-native workflow

`.github/workflows/expo-native-build.yml`, job `native-build`.

- **Triggers**: PRs against `main` touching `packages/expo/**`, `packages/expo-google-signin/**`,
  `integration/templates/expo-native/**`, `integration/tests/expo-native/**`, or the workflow
  itself; plus `workflow_dispatch`.
- **Matrix**: one row per supported Expo SDK per platform (android / ios); the workflow file is
  the authority on which SDKs. Build-only on the older SDKs; **Maestro e2e runs only on the
  newest-SDK rows** (`run-e2e: true`). Fork PRs degrade to build-only (no staging secrets).
- **What it does**: packs `@clerk/expo` + `@clerk/expo-google-signin` tarballs, installs them into
  the fixture with the per-SDK manifest (`package.sdk-<N>.json`), `expo prebuild --clean`, then a
  release `gradlew assembleRelease` / `xcodebuild` (native artifacts cached). E2e rows boot a
  simulator/emulator and run the Maestro flows against the staging instance
  (`clerkstage-with-native-components`), creating and deleting a throwaway BAPI user per run.
  Maestro logs are scrubbed and uploaded as `maestro-<platform>` artifacts on failure.

## The fixture app

`integration/templates/expo-native/`: a single-screen `App.tsx` exercising `AuthView`, the
embedded profile, `UserButton`, and Google sign-in, with the plugin configured in `app.json`
(`expo-secure-store`, `@clerk/expo`, `expo-web-browser`; bundle id
`com.clerk.exponativebuildfixture`).

- One `package.sdk-<N>.json` per supported Expo SDK keeps expo/RN/react in lockstep per matrix
  row. Adding SDK support = adding a manifest + a matrix row.
- Flows locate elements by testID: `open-auth-view-button`, `open-embedded-profile-button`,
  `sign-out-button`, `auth-state`, `user-id`, `custom-logo`, `custom-page-content`,
  `google-sign-in-button`, `google-result`. Renaming one breaks flows; grep
  `integration/tests/expo-native/flows/` first.

## Maestro flows

`integration/tests/expo-native/`:

- `config.yaml`: workspace config; animations disabled on both platforms. **Selector constraint**:
  inside native clerk-android UI there are no testTags, so flows must select by visible English
  text. Instance-localized copy or clerk-android copy changes break flows.
- `flows/*.yaml`: sign-in, session persistence across restart, AuthView detach/reattach, embedded
  profile back-navigation, UserButton sign-out/re-sign-in, custom profile pages, Google
  missing-credentials. `flows/subflows/` are runFlow-only helpers (warmup, open-app, credentials).
- `run-flows.sh` runs one `maestro test` per flow with 1 retry each (warmup first) and writes a
  summary table; `run-android-flows.sh` adds adb install + logcat capture.

**Running locally**: boot a simulator/emulator with the fixture installed, then
`pnpm test:integration:expo-native` with `CLERK_TEST_EMAIL` / `CLERK_TEST_PASSWORD` for a user on
the staging instance. The fixture needs `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` at build time. When a
flow fails in CI, reproduce with a single flow
(`maestro test integration/tests/expo-native/flows/<flow>.yaml`) before touching the suite.

## Web e2e

`integration/tests/expo-web/` + the `expoWeb` preset exist but the root script is
`test:integration:expo-web:disabled`. Do not count on it; treat web behavior as covered by unit
tests plus the shared clerk-js suites.
