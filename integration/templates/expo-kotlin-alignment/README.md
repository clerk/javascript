# Expo 58 Kotlin alignment experiment

This isolated Android fixture explores a fully aligned Kotlin toolchain without
changing Clerk's shipped defaults. It is pinned to published `@clerk/expo@4.7.1`,
not the current monorepo package, so the experiment remains independent of changes
to Clerk's native dependencies and package split.

It complements [#9791](https://github.com/clerk/javascript/pull/9791), which addresses
the immediate release-build failure, and
[#9955](https://github.com/clerk/javascript/pull/9955), which makes native components
optional. [#9974](https://github.com/clerk/javascript/pull/9974) separately enables
optimization in the existing Android integration workflow.

## Configuration

| Input                              | Version                                     |
| ---------------------------------- | ------------------------------------------- |
| Expo                               | 58.0.0-preview.8                            |
| React Native                       | 0.88.0-rc.2                                 |
| React / React DOM                  | 19.3.0                                      |
| Clerk Expo                         | 4.7.1                                       |
| Clerk native API / UI              | 1.1.8, selected by the pinned Clerk package |
| Kotlin / resolved Compose compiler | 2.4.20                                      |
| SavedState Compose                 | 1.3.3                                       |

The official `expo-build-properties` plugin selects Kotlin 2.4.20 and enables
minification and resource shrinking. The fixture-local pnpm patch adds SavedState
Compose, removes six stdlib exclusions, and removes the local, cross-project and
config-plugin metadata-check bypasses. It does not add a `dontwarn` rule.

The dependency reports from the original experiment resolved both the Kotlin
compiler and Compose compiler to 2.4.20 even though Clerk's plugin declaration still
says 2.1.20. No additional Compose patch was necessary on this exact stack.

Only this fixture consumes the patch. It is not an installation recommendation for
older Expo SDKs and does not change Clerk's declared Expo support range. The
expected Expo peer-range warning is retained rather than hidden.

## Run

Use Node 24.15 or newer, pnpm, JDK 17 and an Android SDK. Start an arm64 emulator;
this fixture intentionally builds only `arm64-v8a` to match the original test.

From this directory:

```sh
pnpm install
```

Create an ignored `.env` with your own development-instance publishable key:

```dotenv
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_REPLACE_WITH_YOUR_DEVELOPMENT_KEY
```

```sh
pnpm android --device YOUR_EMULATOR_NAME
```

The publication fixture also passed a fresh pnpm install and optimized build.
Expo CLI subsequently tried to open a development-client URI that this standalone
release does not handle; the build and installation succeeded. If that occurs,
open the installed app from the emulator launcher.

Expo manages prebuild and compilation. After changing native configuration, run
`pnpm prebuild:android` before building again. The fixture refuses a production
publishable key. No secret key or test credentials belong in this directory.

Confirm that `android/app/build/outputs/mapping/release/mapping.txt` is nonempty.
Inspect the generated merged R8 configuration to confirm no
`-dontwarn kotlin.MustUseReturnValues` rule was added, and inspect the patched
Clerk Gradle/plugin files and generated app Gradle file for absent
`-Xskip-metadata-version-check` flags. Dependency reports should confirm the actual
compiler artifacts, not only the configuration property.

## Manual authentication checks

Use an account in the development instance:

1. Sign in through the native form. Complete any verification challenge.
2. Select **Check session token**; the app reports presence, never the token.
3. Force-stop and reopen the app; check that the session and token remain available.
4. Open the profile, unmount/remount it, and confirm it renders again.
5. Sign out and confirm the signed-out form returns.

The original isolated alignment build passed these checks on an API 36 arm64
emulator. Independent development Backend API reads confirmed the session changed
from active to removed. The development test account was deleted afterwards.
The publication fixture removes the original probe's test-user deletion control;
manage any account cleanup separately in your development instance.

## Comparison evidence

These are isolated reproduction results against published Clerk 4.7.1, not a full
execution of #9791 or a certification of all patch releases and auth providers.
Both small-fix variants kept minification and resource shrinking enabled.

| Expo             | React Native | Stock                                       | Remove exclusions | Exact annotation rule |
| ---------------- | ------------ | ------------------------------------------- | ----------------- | --------------------- |
| 54.0.37          | 0.81.5       | Missing annotation                          | Build/auth pass   | Build/auth pass       |
| 55.0.31          | 0.83.10      | Missing annotation                          | Build/auth pass   | Build/auth pass       |
| 56.0.23          | 0.85.3       | Missing annotation                          | Build/auth pass   | Build/auth pass       |
| 57.0.25          | 0.86.3       | Missing annotation                          | Build/auth pass   | Build/auth pass       |
| 58.0.0-preview.8 | 0.88.0-rc.2  | SavedState failure, then missing annotation | Build/auth pass   | Build/auth pass       |

The Expo 54 narrow/runtime checks used native Clerk 1.1.9; the 55–58 checks used
1.1.8. On 58, both small fixes included SavedState Compose 1.3.3; the 1.4.0 addition
from #9791 was separately build/startup-tested on 57. The 58 consumer-rule build
produced identical DEX to the authenticated app-level-rule APK, and merged R8
configuration confirmed delivery from Clerk's library.

Older SDKs emitted metadata warnings with both small fixes. The 55 narrow build
completed R8 with 353 warnings before a disk-full interruption during lint; its
successful unchanged retry reused R8 outputs and must not be called warning-free.
The fully aligned 58 experiment had no R8 metadata warnings.

## Boundaries and next decision

The native publication floor, older Expo compiler constraints and supported
version policy still need maintainer direction. This fixture is deliberately not
a conditional production implementation based on SDK version.

Physical devices, Google/Apple OAuth, passkeys, long-duration token expiry,
existing-install session migration and the full upstream CI suite are outside
this experiment's completed coverage. The package versions are pinned directly;
transitive JavaScript dependencies are resolved at install time, following the
existing standalone fixture convention. Record the generated lockfile when
comparing a later dependency graph.
