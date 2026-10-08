# Custom sign-up flow

An app that builds its own sign-up screen on `useSignUp` creates a user with an email address and password, then verifies the email code.

## Sub-features

- `complete` verifies the code, finalizes the sign-up, and returns to the home, which shows the new user and the session.

## How to get to it (user POV)

- Tap `Custom sign-up` on the signed-out home. The screen has email and password fields, `Send code`, then a code field and `Verify code`.

## Driving it with verify

Preconditions:

- The standard settings require a password at sign-up. The spec uses `Verify-<runId>-Pw1!`.
- The spec reserves a new `+clerk_test` address with `host.newEmail`, which records it for the run. `.claude/skills/verify-clerk-expo/bin/control-clerk-expo down` deletes the application and with it the user the form creates.

- **Request the code.** Run `.claude/skills/verify-clerk-expo/bin/control-clerk-expo run custom-flow-sign-up/complete`. The spec fills `verify.customSignUp.emailAddress` and `verify.customSignUp.password`, taps `verify.customSignUp.sendCode`, and expects `verify.customSignUp.code` with no `verify.customSignUp.error`. The form shows the code field only when `signUp.create` and `sendEmailCode` returned no error. Screenshot `custom-signup-code`.
- **Enter the code.** The spec then types `CLERK_TEST_CODE` and taps `verify.customSignUp.verifyCode`, and `host.expectSignedInAs(email)` waits for the home to show the new email, a user ID, and a session ID. Screenshot `custom-signed-up`.
- **Proof.** The spec shows the home with the new email, a user ID, and a session ID.

## Gotchas

- Type only an address that `host.newEmail` returned, so the run records the identity it created.
- The test app's password field has the one-time-code content type (`textContentType='oneTimeCode'` in `screens/CustomSignUp.tsx`). Without it, iOS covers the keyboard with a `Use Strong Password?` sheet as soon as the field has focus. With it, a spec that only focuses the field sees the keyboard and no sheet. The specs that type the password pass with it.
