# Custom sign-in flow

An app that builds its own sign-in screen on `useSignIn` sends an email code to an existing user and signs them in with it.

## Sub-features

- `complete` verifies the code, finalizes the sign-in, and returns to the home, which shows the user and the session.

## How to get to it (user POV)

- Tap `Custom sign-in` on the signed-out home. The screen has an email field, `Send code`, then a code field and `Verify code`.

## Driving it with verify

Preconditions:

- The standard settings turn the `email_code` strategy on. `up` fails with `INSTANCE_MISCONFIGURED` when the application does not show it.
- The spec seeds its own `+clerk_test` user.

- **Request the code.** Run `.claude/skills/verify-clerk-expo/bin/control-clerk-expo run custom-flow-sign-in/complete`. The spec fills `verify.customSignIn.emailAddress`, taps `verify.customSignIn.sendCode`, and expects `verify.customSignIn.code` with no `verify.customSignIn.error`. The form shows the code field only when `signIn.emailCode.sendCode` returned no error. Screenshot `custom-code`.
- **Enter the code.** The spec then types `CLERK_TEST_CODE` and taps `verify.customSignIn.verifyCode`, and `host.expectSignedInAs(user)` waits for the home to show the user's email, the seeded user ID, and a session ID. Screenshot `custom-signed-in`.
- **Proof.** The spec passes on the platform you changed.

## Gotchas

- These are React Native views with `testID`s, so plain locator actions work. `host.tap` and `host.fill` also work and keep specs uniform. On iOS an empty one reads as its placeholder, and `host.fill` replaces its contents once when the field does not hold the text.
- A sign-in error shows in `verify.customSignIn.error`, and the form stays on screen. Read the error text from the failure page when a spec stops on the email screen.
- The test app shows the form only while nobody has an active session. Once the sign-in is finalized it shows the home, so the form on screen also means that nobody is signed in yet.
- The screen keeps no state across launches. Every launch starts on the home, and the form opens on the email field.
