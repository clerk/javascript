# Custom sign-up flow

An app that builds its own sign-up screen on `useSignUp` creates a user with an email address and password, then verifies the email code.

## Sub-features

- `request-code` creates the sign-up and shows the code field.
- `complete` verifies the code, finalizes the sign-up, and reports an active session.

## How to get to it (user POV)

- Launch `verifyScreen customSignUp`. The screen has email and password fields, `Send code`, then a code field and `Verify code`.

## Driving it with verify

Preconditions:

- The standard settings require a password at sign-up. The spec uses `Verify-<runId>-Pw1!`.
- The spec reserves a new `+clerk_test` address with `host.newEmail`, so `.claude/skills/verify-clerk-expo/bin/control-clerk-expo down` deletes the user the form creates along with the application.

- **Request the code.** Run `.claude/skills/verify-clerk-expo/bin/control-clerk-expo run custom-flow-sign-up/request-code` (tag `form-entry`, because it types a password, and no recorded passing run). The spec fills `verify.customSignUp.emailAddress` and `verify.customSignUp.password`, taps `verify.customSignUp.sendCode`, expects `verify.customSignUp.code`, and waits for `signUpStatus` `missing_requirements`. Screenshot `custom-signup-code`.
- **Enter the code.** Run `.claude/skills/verify-clerk-expo/bin/control-clerk-expo run custom-flow-sign-up/complete` (tag `form-entry`, no recorded passing run). It types `CLERK_TEST_CODE`, taps `verify.customSignUp.verifyCode`, and waits for `signedIn` true with `sessionStatus` `active` and a non-null `userId`. Screenshots `custom-signup-code` and `custom-signed-up`.
- **Proof.** `request-code` asserts `signUpStatus` `missing_requirements` with `signedIn` false. `complete` asserts an active session with a non-null `userId`, which `states.jsonl` records.

## Gotchas

- Type only an address that `host.newEmail` returned, so the run records the identity it created.
- The request-code spec leaves an unfinished sign-up. Clerk expires it, and it creates no user.
- The fixture's password field has the one-time-code content type (`textContentType='oneTimeCode'` in `screens/CustomSignUp.tsx`). Without it, iOS covers the keyboard with a `Use Strong Password?` sheet as soon as the field has focus. With it, a spec that only focuses the field sees the keyboard and no sheet. A typed password has not been observed.
