# @clerk/expo verification map

This directory is the maintained source for verifying the user-facing behavior of `@clerk/expo` through the `expo-native` fixture app in `integration/templates/expo-native`. The fixture runs as a Debug dev client that loads its JS, and `packages/expo` with it, from a local Metro server. Read this index before driving the app, then use the matching feature file as the recipe. Every recipe runs through the `verify` CLI and golden specs under `specs/golden/<feature>/`.

## Baseline preconditions

- Run every command from `packages/expo/.claude/skills/verify/` in a worktree of clerk/javascript. Run `pnpm install` once at the repo root and `npm ci` once in the skill directory.
- Run `bin/verify doctor --platform ios` (or `android`) first. Every check is `ok` except `build` before the first `bin/verify up`.
- `integration/.keys.json` in the main clerk/javascript checkout (not a linked worktree) holds `pk` and `sk` for `with-email-codes`, `with-session-tasks`, and `with-session-tasks-setup-mfa`. Only the CLI reads it. Agents cannot read it, and the CLI never prints a key.
- The CLI drives only its own lane devices. On iOS that is `verify-ios-<n>`, cloned from `Clerk Verify Template iOS`. On Android it is `Clerk_Verify_Pixel` booted `-read-only` as `emulator-5560` or `emulator-5562`. Never drive `iPhone Air`, a physical device, or a device another worktree holds.
- Every launch gets a new `verifyStorageScope`, so no spec inherits a session from another spec.

### Test users and sign-in

- **Emails.** Any address that contains `+clerk_test@` is a test address. Clerk sends no mail and accepts the code below. The fixture mints `verify_<runId>_<n>+clerk_test@example.com` per run with `host.newEmail(instance)` or `host.seedUser({ instance })`.
- **Phones.** US numbers 555-0100 to 555-0199 are test numbers, typed as ten digits such as `5555550142`. They are shared across repos, CI, and agents, so get one from `host.seedUser({ instance, phone: true })` instead of picking one by hand.
- **One-time code.** `424242` verifies every email and SMS code for test addresses and phones. Specs use the constant `CLERK_TEST_CODE`. It is public and not an e2e secret, so screenshots after the fill are kept.
- **Passwords.** `with-email-codes` requires a password at sign-up. Use a throwaway per run, such as `Verify-<runId>-Pw1!`.
- **Authenticator codes.** Read the setup key from the MFA setup screen and compute the 6-digit RFC 6238 code (SHA-1, 30 second step).

| Instance key in `integration/.keys.json`        | Use it for                                                       |
| ----------------------------------------------- | ---------------------------------------------------------------- |
| `with-email-codes` (the `all-enabled` instance) | Every auth method and every signed-in feature.                   |
| `with-session-tasks-setup-mfa`                  | Sign-ins that must stop on the setup-MFA session task.           |
| `with-session-tasks`                            | Sign-ins that must stop on the choose-organization session task. |

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

- Type only `+clerk_test` emails, 555-0100 to 0199 phones, and `424242`. The repo is public and every video can land on a PR.
- Use ticket sign-in (`host.launch({ signedInAs })`) only to reach signed-in screens for features that are not about authentication. A change to an auth method gets a spec that drives the real form.
- Tag every spec that types a code `form-entry`. Those specs run by default. A runtime that refuses to type codes into an app that talks to hosted Clerk runs `bin/verify run --skip form-entry` and says so in the PR.
- `bin/verify down` deletes every user the run created, including users created through the sign-up form, by their test email.

## Driving conventions

- Input only goes through specs. To look at any state past launch, write a spec, `bin/verify run` it, then `bin/verify screen`.
- `verifyScreen` routes the host: `home` (the fixture's own screen), `auth` (inline AuthView), `nativeAuth` (dismissible AuthView), `userButton`, `userProfile`, `customSignIn`, `customSignUp`, `sso`, and `tokenCache`. `state.screen` reports what is on screen: `launching` during a ticket sign-in, `error` for a rejected key.
- Prefer SDK identifiers on iOS and fixture testIDs everywhere. `specs/native.ts` holds the per-platform locators for native views that have no Android tag yet.
- Inside native SwiftUI views, act with `host.tap(locator)` and `host.fill(locator, text)`. agent-device reports SwiftUI views inside the React Native host as covered, and refuses `locator.tap()` and `locator.fill()` on them.
- Prove results from `verify.state` (`host.launch`, `host.state`, `host.waitForState`), not from the screen alone. The Expo host adds `extra.authViewLoaded` and `extra.authFlowComplete` from `useAuthViewState`. Every spec keeps at least one exact assertion on `verify.state` or an SDK identifier.

## Proof and skip reporting

- A proof is a passing `bin/verify run` whose run directory holds `video.mp4`, `screenshots/`, `states.jsonl`, `state.json`, `app.log`, and `e2e/report.json`. `states.jsonl` is the state proof on both platforms. On Android `app.log` also carries the `[verify]` console lines. On iOS it carries only the app's native log lines, and the JS console lines, a JS change's own log lines included, are in `.verify/runtime/metro-<port>.log`, after this run's first state line.
- Name the run id, the platform, and the specs in the PR. Attach with `bin/verify attach <run-id> --pr <n>`.
- Report a skipped `form-entry` spec as skipped with the reason. The CLI prints `skipped by --skip form-entry`. Never report it as verified through a ticket launch.
- A runtime that skips form entry proves each auth flow up to its code screen with the `request-code` spec, and reports the `complete` spec as skipped.
- A spec limited to one platform reports as skipped on the other. Say which platform each proof ran on.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior, then exactly four H2 sections in this order: `Sub-features`, `How to get to it (user POV)`, `Driving it with verify`, and `Gotchas`. `Driving it with verify` starts with `Preconditions:` and names the golden specs that prove each sub-feature.

## Features

- [Native AuthView](./native-auth-view.md) covers opening, dismissing, and signing in through the native AuthView.
- [User button and profile](./user-button-and-profile.md) covers the native UserButton and UserProfileView.
- [Custom sign-in flow](./custom-flow-sign-in.md) covers an email code sign-in built on `useSignIn`.
- [Custom sign-up flow](./custom-flow-sign-up.md) covers an email and password sign-up built on `useSignUp`.
- [Token cache persistence](./token-cache-persistence.md) covers restoring the session after a relaunch.
- [Native and JS session sync](./native-js-sync.md) covers a native sign-out reaching the JS hooks.

Not mapped yet: SSO through `useSSO` (no real OAuth on simulators; `verifyScreen sso` opens the Google button), Google and Apple native sign-in, passkeys and biometrics (no associated domains or Secure Enclave on the simulator), and session tasks in the native views.
