# Custom sign-in flow

An app that builds its own sign-in screen on `useSignIn` sends an email code to an existing user and signs them in with it.

## Sub-features

- `request-code` sends the email code and shows the code field.
- `complete` verifies the code, finalizes the sign-in, and reports an active session.

## How to get to it (user POV)

- Launch `verifyScreen customSignIn`. The screen has an email field, `Send code`, then a code field and `Verify code`.

## Driving it with verify

Preconditions:

- The standard settings turn the `email_code` strategy on. `up` fails with `INSTANCE_MISCONFIGURED` when the application does not show it.
- The spec seeds its own `+clerk_test` user.

- **Request the code.** Run `.claude/skills/verify-clerk-expo/bin/control-clerk-expo run custom-flow-sign-in/request-code`. The spec fills `verify.customSignIn.emailAddress`, taps `verify.customSignIn.sendCode`, expects `verify.customSignIn.code`, and waits for `signInStatus` `needs_first_factor`. Screenshot `custom-code`.
- **Enter the code.** Run `.claude/skills/verify-clerk-expo/bin/control-clerk-expo run custom-flow-sign-in/complete` (tag `form-entry`, no recorded passing run). It types `CLERK_TEST_CODE`, taps `verify.customSignIn.verifyCode`, and waits for `signedIn` true with the seeded `userId`. Screenshots `custom-code` and `custom-signed-in`.
- **Proof.** Both specs pass on the platform you changed. A runtime that must use `--skip form-entry` proves `request-code` only and reports `complete` as skipped.

## Gotchas

- These are React Native views with `testID`s, so plain locator actions work. `host.tap` and `host.fill` also work and keep specs uniform.
- A sign-in error shows in `verify.customSignIn.error`. It does not reach `lastError`. Read the error text from the failure page when a spec stops on the email screen.
- The screen keeps no state across launches. Every launch starts on the email field.
