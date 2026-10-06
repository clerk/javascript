# @clerk/expo verification map

This directory is the maintained source for verifying the user-facing behavior of `@clerk/expo` through the `expo-native` fixture app in `integration/templates/expo-native`. The fixture runs as a Debug dev client that loads its JS, and `packages/expo` with it, from a local Metro server. Read this index before driving the app, then use the matching feature file as the recipe. Every recipe runs through `.claude/skills/verify-clerk-expo/bin/control-clerk-expo` and the golden specs under `specs/golden/<feature>/`.

## Baseline preconditions

- Run commands from the root of a clerk/javascript worktree. Run `pnpm install` and `npm ci --prefix .claude/skills/verify-clerk-expo` once there. Paths that start with `.verify/` or `specs/` are inside the skill directory.
- Run `.claude/skills/verify-clerk-expo/bin/control-clerk-expo doctor --platform ios` (or `android`) first. Before the first `up`, `build` is the one failing check.
- `up` needs the team's Clerk Platform API key: `CLERK_PLATFORM_API_KEY` or `CLERK_PLATFORM_API_KEY_FILE`, or a 1Password reference that the machine holds outside the repository. `doctor` names the one it found in its `instances` line and prints one fix line when there is none. Do not read or print the key.
- The CLI drives only lanes it owns. On iOS a lane is `verify-ios-<n>`, cloned from `Clerk Verify Template iOS`. On Android it is `Clerk_Verify_Pixel` booted `-read-only` as `emulator-5560` or `emulator-5562`. Never drive a simulator or emulator the CLI did not create, or a device another worktree holds.
- Every launch gets a new `verifyStorageScope` unless it passes `keepStorage: true`, so no spec inherits a session from another spec.

## Test users and sign-in

A change that touches sign-in or sign-up gets a spec that drives the real form. Anything else reaches a signed-in state with a ticket (`host.launch({ signedInAs })`). SKILL.md has the rule, and these are the identifiers a spec needs.

- **Emails.** Any address that contains `+clerk_test@` is a test address. Clerk sends no mail and accepts the code below. `host.newEmail()` and `host.seedUser()` mint `verify_<runId>_<n>+clerk_test@example.com`, new per run.
- **One-time code.** `424242` verifies every email code for a test address. Specs use the constant `CLERK_TEST_CODE`.
- **Passwords.** The standard settings require a password at sign-up. Use a throwaway per run, such as `Verify-<runId>-Pw1!`.

| Step                                        | Native AuthView (iOS identifier)                 | Custom flow (fixture testID)                                           |
| ------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------- |
| Email field                                 | `clerk.auth.start.identifier`                    | `verify.customSignIn.emailAddress`, `verify.customSignUp.emailAddress` |
| Switch between email and phone              | `clerk.auth.start.identifierSwitcher`            | none                                                                   |
| Phone field                                 | `clerk.auth.start.phoneNumber`                   | none                                                                   |
| Continue or send code                       | `clerk.auth.start.continue`                      | `verify.customSignIn.sendCode`, `verify.customSignUp.sendCode`         |
| Try another method on the email link screen | the `Use another method` text                    | none                                                                   |
| Pick a method from the list                 | `clerk.auth.signIn.alternativeMethod.<strategy>` | none                                                                   |
| Sign-in code field                          | `clerk.auth.signIn.code`                         | `verify.customSignIn.code`, then `verify.customSignIn.verifyCode`      |
| Sign-up password                            | `clerk.auth.signUp.password`                     | `verify.customSignUp.password`                                         |
| Sign-up code field                          | `clerk.auth.signUp.code`                         | `verify.customSignUp.code`, then `verify.customSignUp.verifyCode`      |
| Close AuthView                              | `clerk.dismissButton`                            | none                                                                   |

The iOS identifiers come from `Sources/ClerkKitUI/Components/Auth/ClerkAccessibilityIdentifiers.swift` in the clerk-ios release that `packages/expo/ios/ClerkExpo.podspec` pins. The clerk-android release that `@clerk/expo` pins has no test tags, so Android specs find native views by their text. The custom-flow testIDs live in `integration/templates/expo-native/screens/`.

Rules:

- Type only `+clerk_test` emails and `424242`. The repo is public and every video can land on a PR.
- Use ticket sign-in only to reach signed-in screens for features that are not about authentication.
- Tag every spec that types a code or a password `form-entry`. Those specs run by default. A runtime that cannot type codes into the app passes `--skip form-entry` to `run` and says so in the PR.
- `down` deletes the worktree's application and every user in it, including users created through the sign-up form.

## Driving conventions

- Input reaches the app only through specs. To look at a state past launch, write a spec, `run` it, then run `screen`.
- `verifyScreen` routes the host: `home` (the fixture's own screen), `auth` (AuthView with no close button), `nativeAuth` (AuthView with a close button), `userButton`, `userProfile`, `customSignIn`, `customSignUp`, and `tokenCache`. `state.screen` reports what is on screen: `launching` during a ticket sign-in, `error` for a rejected key.
- Prefer SDK identifiers on iOS and fixture testIDs everywhere. `specs/native.ts` holds the per-platform locators for native views that have no Android tag yet.
- Inside native SwiftUI views, act with `host.tap(locator)` and `host.fill(locator, text)`. agent-device reports SwiftUI views inside the React Native host as covered, and refuses `locator.tap()` and `locator.fill()` on them.
- Prove results from `verify.state` (`host.launch`, `host.state`, `host.waitForState`), not from the screen alone. Its fields are `v`, `screen`, `environmentLoaded`, `signedIn`, `userId`, `sessionId`, `sessionStatus`, `pendingTasks`, `orgId`, `signInStatus`, `signUpStatus`, `ticket`, `lastError`, `runId`, `launchId`, and `extra`. `v` is the version of the state contract. The fixture puts `authViewLoaded` and `authFlowComplete` from `useAuthViewState` in `extra`. Every spec keeps at least one exact assertion on `verify.state` or an SDK identifier.

## Proof and skip reporting

- A proof is a passing `run` whose run directory holds `video.mp4`, `screenshots/`, `states.jsonl`, `state.json`, `app.log`, and `e2e/report.json`. `states.jsonl` is the state proof on both platforms. On Android `app.log` also has the app's `[verify]` console lines. On iOS it has native log lines only, and the JS console lines, a JS change's own log lines included, are in `.verify/runtime/metro-<port>.log`. Read this run's part of that log by `runId`, as `references/freshness.md` describes.
- Name the run id, the platform, and the specs in the PR. Attach the run with `attach <run-id> --pr <n>`.
- Four specs carry `form-entry`: `custom-flow-sign-in/complete`, `custom-flow-sign-up/request-code`, `custom-flow-sign-up/complete`, and `native-auth-view/complete`. None has a recorded passing run. Report a skipped one as skipped with the reason the CLI prints, `skipped by --skip form-entry`, and never as verified through a ticket launch.
- `custom-flow-sign-in/request-code` and `native-auth-view/request-code` (iOS) type no code or password, so `--skip form-entry` still runs them and they prove their flow up to the code screen. Sign-up has no such spec.
- A spec limited to one platform reports as skipped on the other. Say which platform each proof ran on.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior, then exactly four H2 sections in this order: `Sub-features`, `How to get to it (user POV)`, `Driving it with verify`, and `Gotchas`. `Driving it with verify` starts with `Preconditions:` and names the golden specs that prove each sub-feature. A feature file lists only entry points that a spec drives.

## Features

- [Native AuthView](./native-auth-view.md) covers opening, dismissing, and signing in through the native AuthView.
- [User button and profile](./user-button-and-profile.md) covers the native UserButton and UserProfileView.
- [Custom sign-in flow](./custom-flow-sign-in.md) covers an email code sign-in built on `useSignIn`.
- [Custom sign-up flow](./custom-flow-sign-up.md) covers an email and password sign-up built on `useSignUp`.
- [Token cache persistence](./token-cache-persistence.md) covers restoring the session after a relaunch.
- [Native and JS session sync](./native-js-sync.md) covers a native sign-out reaching the JS hooks.

Not mapped yet: SSO through `useSSO` (no real OAuth on simulators), Google and Apple native sign-in, passkeys and biometrics (no associated domains or Secure Enclave on the simulator), and session tasks in the native views.
