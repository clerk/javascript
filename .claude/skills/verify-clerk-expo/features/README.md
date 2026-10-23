# @clerk/expo verification map

This directory is the maintained source for verifying the user-facing behavior of `@clerk/expo` through the `expo-native` test app in `integration/templates/expo-native`. On a local device the test app runs as a Debug dev client that loads its JS, and `packages/expo` with it, from a local Metro server. On a remote device it runs as a standalone Release build of a pushed commit, with the JS embedded. Read this index before driving the app, then use the matching feature file as the recipe. Every recipe runs through `integration/expo-native/bin/control-clerk-expo` and the specs under `specs/features/<feature>/`.

## Baseline preconditions

`SKILL.md` under Launch has the setup and the commands. These facts hold for every recipe here, on both platforms.

- The standard settings have every auth method and signed-in feature that these recipes use. The `settings` check of `doctor` compares the live instance with the standard file once the worktree holds an application.
- Every launch gets a new `verifyStorageScope`, so no spec inherits a session from another spec. A launch with `keepStorage: true` reuses the scope of the launch before it in the same test.
- `down` deletes this worktree's application, and with it every user and organization a run created, including users created through the sign-up form. `down --platform <p>` keeps the application while the other platform still holds a lease in this worktree. It deletes the application when the other platform holds no lease.

## Test users and sign-in

`.claude/skills/verify-clerk-expo/SKILL.md` has the rules for signing in. These are the test identities and the identifiers a spec needs.

- **Emails.** Any address that contains `+clerk_test@` is a test address. Clerk sends no mail and accepts the code below. `host.newEmail()` and `host.seedUser()` mint an address such as `maya.7c1e+clerk_test@example.com`, a first name and the run tag, new for each test of the run.
- **One-time code.** `424242` verifies every email code for a test address. Specs use the constant `CLERK_TEST_CODE`.
- **Passwords.** The standard settings require a password at sign-up. Fill it with `runPassword(host.runId)` from `@clerk/internal-mobile-e2e/specs/support/clerk`, such as `Otter-Lamp-3917`. For a password sign-in, seed the user with `host.seedUser({ password: true })` and fill the field with `host.fill(field, user.password!)`.

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

The iOS identifiers come from `Sources/ClerkKitUI/Components/Auth/ClerkAccessibilityIdentifiers.swift` in the clerk-ios release that `packages/expo-native-components/ios/ClerkExpo.podspec` pins. The clerk-android release that `packages/expo-native-components/android/build.gradle` pins has no test tags, so Android specs find native views by their text. The custom-flow testIDs live in `integration/templates/expo-native/screens/`.

## Driving conventions

- Prefer SDK identifiers on iOS and test app testIDs everywhere. `specs/native.ts` holds the per-platform locators for native views that have no Android tag yet.
- Look first in the native view on the spec's path: the AuthView code screen, or the profile and its `Manage account` screen. Use the `Token cache` screen for what the token cache held when the app started.

## Proof and skip reporting

- A proof is a passing `run` whose run directory holds `video.mp4`, `screenshots/`, `app.log`, and `e2e/report.json`. The video and the screenshots are the proof on both platforms.
- Name the run id, the platform, and the specs in the PR. Attach the run with `attach <run-id> --pr <n>` and `--screenshot <label>` for a still change or `--video` for behavior or a flow, with the part that shows the change inside `host.evidence`. Add `--before <run-id>` when the change is to something that exists. `SKILL.md` has the choice under Evidence.
- A spec limited to one platform reports as skipped on the other. Say which platform, and local or remote device, each proof ran on.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior, then exactly four H2 sections in this order: `Sub-features`, `How to get to it (user POV)`, `Driving it with verify`, and `Gotchas`. `Driving it with verify` starts with `Preconditions:` and names the specs that prove each sub-feature. A feature file lists only entry points that a spec drives.

## Features

- [Native AuthView](./native-auth-view.md) covers opening, closing, and signing in through the native AuthView, and its React Native logo.
- [User button and profile](./user-button-and-profile.md) covers the native UserButton, the profile it opens, the home's sign-out button, and an inline UserProfileView with `onHostBack` and a custom page.
- [Custom sign-in flow](./custom-flow-sign-in.md) covers an email code sign-in built on `useSignIn`.
- [Custom sign-up flow](./custom-flow-sign-up.md) covers an email and password sign-up built on `useSignUp`.
- [Token cache persistence](./token-cache-persistence.md) covers restoring the same session after a relaunch.
- [Native and JS session sync](./native-js-sync.md) covers a native sign-out and a native password sign-in reaching `useAuth`, `useUser`, and `useSession`, that sign-in surviving a relaunch, a second native sign-in in one process, a ticket sign-in reaching the native profile, and a JS sign-out clearing the hooks.
- [Native modules](./native-modules.md) covers `useSignInWithGoogle` opening the native Google sign-in, a cancel of it on iOS, and `useBiometricCredentials` reporting what its native module found on the device.

Not mapped yet: SSO through `useSSO` (no real OAuth on simulators), a Google or Apple native sign-in with a real account, passkeys, enrolling or using a biometric (no associated domains or Secure Enclave on the simulator), and session tasks in the native views.

Organizations have no page, because a user of the test app has no way to reach organization UI. This holds for the native components only. `@clerk/expo/web` exports the clerk-js OrganizationProfile, OrganizationSwitcher, OrganizationList, and CreateOrganization for Expo web, but the test app runs native only. `@clerk/expo-native-components` exports AuthView, UserButton, and UserProfileView and no OrganizationSwitcher or OrganizationProfileView. The profile that the UserButton opens lists `Manage account`, `Security`, `Add account`, and `Sign out`, with `Switch account` once a second session exists, and no organization row, in clerk-ios 1.6.1 and clerk-android 1.1.11, though the standard settings turn organizations on. The one organization screen that a native view shows is a session task in AuthView, choose or create an organization, which needs `force_organization_selection` on. The harness seeds users and sign-in tickets only. It cannot seed organizations, roles, memberships, or invitations, so no spec can reach a choose-organization task that lists an existing membership or invitation. Today such a state can be shown only with a local patch that is not committed, and the description of the pull request that shows it says so.
