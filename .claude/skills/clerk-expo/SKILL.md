---
name: clerk-expo
description: >-
  Work on the @clerk/expo package (packages/expo), Clerk's React Native / Expo SDK. Use when
  changing anything under packages/expo (TypeScript, the ios/ Swift or android/ Kotlin native
  layer, the config plugin, the JS-to-native client sync), debugging native sync / bootstrap /
  401-recovery issues, touching the expo-native e2e fixture or Maestro flows, or bumping the
  pinned clerk-ios or clerk-android versions. Invoke before editing any file under packages/expo,
  even for small TypeScript-only changes. Repo-wide rules (changesets, commits, build loop) live
  in the clerk-monorepo skill.
---

# Working on @clerk/expo

`@clerk/expo` is the only package in this monorepo that is not pure TypeScript. It ships three
layers that must stay in lockstep:

1. **JS layer** (`src/`): `ClerkProvider`, hooks, control components, token/resource caches. Wraps
   `@clerk/clerk-js` + `@clerk/react` like the other framework SDKs.
2. **Native layer** (`ios/` Swift, `android/` Kotlin, `src/specs/` + `src/native/` on the TS side):
   Expo modules that embed the separate **clerk-ios** and **clerk-android** SDKs for native UI
   (`AuthView`, `UserProfileView`, `UserButton`) and keep the JS and native Clerk clients in sync.
3. **Config plugin** (`app.plugin.js`, loaded via `"plugins": ["@clerk/expo"]`): prebuild-time
   changes (iOS deployment-target floor, Apple Sign-In entitlement, hosted-auth intent filter,
   theme embedding, Kotlin metadata workaround).

**REQUIRED BACKGROUND:** the `clerk-monorepo` skill owns setup, the pnpm/turbo dev loop,
changesets, conventional commits, and PR rules. This skill covers only what is expo-specific and
does not restate any of it.

Not for: consumer-facing "how do I add Clerk to my Expo app" questions (that is the README and
clerk.com docs), or the sibling packages `@clerk/expo-passkeys` / `@clerk/expo-google-signin`
(separate packages, though the e2e fixture exercises google-signin).

## Package anatomy: subpath exports

| Subpath                                | What it provides                                                                              |
| -------------------------------------- | --------------------------------------------------------------------------------------------- |
| `.`                                    | `ClerkProvider`, `getClerkInstance`, hooks (re-exported from `@clerk/react`), trusted devices |
| `./native`                             | Native SwiftUI/Compose UI: `AuthView`, `UserProfileView`, `UserButton` + hooks                |
| `./web`                                | clerk-js prebuilt web components, throw on non-web platforms                                  |
| `./token-cache`                        | expo-secure-store token cache (`undefined` on web)                                            |
| `./resource-cache`                     | Secure-store resource cache with 1024-byte chunking + A/B slots (2048-byte SecureStore limit) |
| `./secure-store`                       | Deprecated alias for `./resource-cache`                                                       |
| `./google`, `./apple`, `./hosted-auth` | `useSignInWithGoogle` / `useSignInWithApple` / `useHostedAuth`                                |
| `./passkeys`, `./local-credentials`    | Passkeys (re-export of optional peer `@clerk/expo-passkeys`), biometric local credentials     |
| `./experimental`, `./legacy`           | `useSSO` (experimental); `useSignIn`/`useSignUp` from `@clerk/react/legacy`                   |
| `./types`                              | Types only                                                                                    |

New public API goes in the narrowest subpath that fits; `experimental` for anything not yet under
SemVer. Platform splits use Metro resolution (`.ios.ts` / `.android.ts` / `.web.ts`), which the
tsdown build preserves via `unbundle: true`. Never bundle relative imports or platform resolution
breaks in consumers.

## The verification ladder

Green vitest is the floor, not the finish line. Pick the highest rung your change reaches:

1. **`pnpm --filter @clerk/expo test`** (vitest, jsdom): covers the TS layer, the sync
   coordinator, spec contract checks, and the config plugin (`app.plugin.js` exposes `_testing`).
   Native modules are mocked per test file; nothing native executes.
2. **Fixture build**: any change to `ios/`, `android/`, `app.plugin.js`, `expo-module.config.json`,
   or `src/specs/` needs a real prebuild + native compile. CI does this for you on the PR
   (`.github/workflows/expo-native-build.yml`). Locally, pack the tarball into
   `integration/templates/expo-native` and `expo prebuild --clean`.
3. **Maestro e2e**: behavior changes to native views or client sync need the flows in
   `integration/tests/expo-native/flows/`. CI runs them on the newest-SDK matrix rows only.

Swift tests (`ios/Tests/`, a podspec `test_spec`) and Kotlin JUnit tests (`android/src/test/`)
exist but **no CI workflow runs them**. Run them manually when touching that code, and do not
assume CI caught a regression there.

Details, local run commands, and the fixture/testID contract:
[`references/testing-and-e2e.md`](references/testing-and-e2e.md).

## Hard rules and known traps

| Situation                                          | Rule                                                                                                                                                                                                                                                                                      |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Renaming an `AsyncFunction`, event, or module name | Swift `Name("ClerkExpo")`, Kotlin `Name("ClerkExpo")`, and `src/specs/*` must all change together; the TS side runtime-checks the contract shape.                                                                                                                                         |
| Bumping clerk-ios / clerk-android                  | Never hand-edit the pins; each native SDK's repo opens a bump PR against clerk/javascript on release. See "Native SDK version pinning" in [`references/native-architecture.md`](references/native-architecture.md).                                                                       |
| "Cannot find native module ClerkExpo"              | Expected in Expo Go and in apps missing the plugin; `requireOptionalNativeModule` returns `null` and code must degrade, never throw at import time.                                                                                                                                       |
| Editing sync timing constants                      | The tunables at the top of `src/provider/nativeClientSync.tsx` (bootstrap timeout, 401 cooldown, poll intervals) encode fixes for real production races. Understand the incident behind one before changing it: [`references/native-architecture.md`](references/native-architecture.md). |
| Changing the config plugin                         | `app.plugin.js` (root, published) is the real plugin; `src/plugin/withClerkExpo.ts` is a smaller compiled variant. Tests import `app.plugin.js`'s `_testing` export.                                                                                                                      |
| iOS deployment target                              | `CLERK_MIN_IOS_VERSION` in `app.plugin.js` must match `s.platforms` in the podspec.                                                                                                                                                                                                       |
| Peer ranges                                        | `package.json` peers are the truth; the README's looser prerequisites are stale. The podspec independently raises below its RN floor.                                                                                                                                                     |
| Backwards compat                                   | The package rides the repo-wide rules, and additionally the native SDKs version independently of npm. A JS change must tolerate the _pinned_ native SDK, not clerk-ios/android `main`.                                                                                                    |

## Deeper references

- [`references/native-architecture.md`](references/native-architecture.md): module registration,
  the TS-to-native bridge, the JS/native client sync state machine (bootstrap, events, 401
  cooldown, coordinator), and version pinning.
- [`references/testing-and-e2e.md`](references/testing-and-e2e.md): vitest setup, the
  expo-native-build workflow matrix, the fixture app, Maestro flows and their selector
  constraints, running e2e locally.
- `packages/expo/README.md`: consumer-facing docs.
- clerk-ios / clerk-android live in their own repos (`clerk/clerk-ios`, `clerk/clerk-android`);
  this package consumes their releases, never their source.
