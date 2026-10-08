# @clerk/expo verification map

This directory is the maintained source for verifying the user-facing behavior of `@clerk/expo` through the `expo-native` test app in `integration/templates/expo-native`. On a local device the test app runs as a Debug dev client that loads its JS, and `packages/expo` with it, from a local Metro server. Read this index before driving the app, then use the matching feature file as the recipe. Every recipe runs through `.claude/skills/verify-clerk-expo/bin/control-clerk-expo` and the golden specs under `specs/golden/<feature>/`.

## Test users and sign-in

`SKILL.md` has the rules for signing in. These are the test identities and the identifiers a spec needs.

- **Emails.** Any address that contains `+clerk_test@` is a test address. Clerk sends no mail and accepts the code below. `host.newEmail()` and `host.seedUser()` mint `verify_<runId>_<n>+clerk_test@example.com`, new per run.
- **One-time code.** `424242` verifies every email code for a test address. Specs use the constant `CLERK_TEST_CODE`.
- **Passwords.** The standard settings require a password at sign-up. Use a throwaway per run, such as `Verify-<runId>-Pw1!`. For a password sign-in, seed the user with `host.seedUser({ password: true })` and fill the field with `host.fill(field, user.password!)`.

| Step                                        | Native AuthView (iOS identifier)                                | Custom flow (test app testID)                                          |
| ------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Email field                                 | `clerk.auth.start.identifier`                                   | `verify.customSignIn.emailAddress`, `verify.customSignUp.emailAddress` |
| Switch between email and phone              | `clerk.auth.start.identifierSwitcher`                           | none                                                                   |
| Phone field                                 | `clerk.auth.start.phoneNumber`                                  | none                                                                   |
| Continue or send code                       | `clerk.auth.start.continue`                                     | `verify.customSignIn.sendCode`, `verify.customSignUp.sendCode`         |
| Try another method on the email link screen | the `Use another method` text                                   | none                                                                   |
| Pick a method from the list                 | `clerk.auth.signIn.alternativeMethod.<strategy>`                | none                                                                   |
| Sign-in code field                          | `clerk.auth.signIn.code`                                        | `verify.customSignIn.code`, then `verify.customSignIn.verifyCode`      |
| Sign-in password                            | `clerk.auth.signIn.password`, then `clerk.auth.signIn.continue` | none                                                                   |
| Sign-up password                            | `clerk.auth.signUp.password`                                    | `verify.customSignUp.password`                                         |
| Sign-up code field                          | `clerk.auth.signUp.code`                                        | `verify.customSignUp.code`, then `verify.customSignUp.verifyCode`      |
| Close AuthView                              | `clerk.dismissButton`                                           | none                                                                   |

The iOS identifiers come from `Sources/ClerkKitUI/Components/Auth/ClerkAccessibilityIdentifiers.swift` in the clerk-ios release that `packages/expo/ios/ClerkExpo.podspec` pins. The clerk-android release that `@clerk/expo` pins has no test tags, so Android specs find native views by their text. The custom-flow testIDs live in `integration/templates/expo-native/screens/`.

## Driving conventions

- Prefer SDK identifiers on iOS and test app testIDs everywhere. `specs/native.ts` holds the per-platform locators for native views that have no Android tag yet.
- Look first in the native view on the spec's path: the AuthView code screen, or the profile and its `Manage account` screen. Use the `Token cache` screen for what the token cache held when the app started.

## Proof and skip reporting

- A proof is a passing `run` whose run directory holds `video.mp4`, `screenshots/`, `app.log`, and `e2e/report.json`. The video and the screenshots are the proof on both platforms.
- Name the run id, the platform, and the specs in the PR. Attach the run with `attach <run-id> --pr <n>`.
- A spec limited to one platform reports as skipped on the other. Say which platform each proof ran on.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior, then exactly four H2 sections in this order: `Sub-features`, `How to get to it (user POV)`, `Driving it with verify`, and `Gotchas`. `Driving it with verify` starts with `Preconditions:` and names the golden specs that prove each sub-feature. A feature file lists only entry points that a spec drives.

## Features

- [Native AuthView](./native-auth-view.md) covers opening, closing, and signing in through the native AuthView, and its React Native logo.
- [User button and profile](./user-button-and-profile.md) covers the native UserButton, the profile it opens, the home's sign-out button, and an inline UserProfileView with `onHostBack` and a custom page.
- [Custom sign-in flow](./custom-flow-sign-in.md) covers an email code sign-in built on `useSignIn`.
- [Custom sign-up flow](./custom-flow-sign-up.md) covers an email and password sign-up built on `useSignUp`.
- [Token cache persistence](./token-cache-persistence.md) covers restoring the same session after a relaunch.
- [Native and JS session sync](./native-js-sync.md) covers a native sign-out and a native password sign-in reaching `useAuth`, `useUser`, and `useSession`, and that sign-in surviving a relaunch.
- [Native modules](./native-modules.md) covers `useSignInWithGoogle` opening the native Google sign-in and a cancel of it, and `useBiometricCredentials` reporting what its native module found on the device.

Not mapped yet: SSO through `useSSO` (no real OAuth on simulators), a Google or Apple native sign-in with a real account, passkeys, enrolling or using a biometric (no associated domains or Secure Enclave on the simulator), and session tasks in the native views.
