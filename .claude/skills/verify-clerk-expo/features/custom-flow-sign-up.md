# Custom sign-up flow

An app that builds its own sign-up screen on `useSignUp` creates a user with an email address and password, then verifies the email code.

## Sub-features

- `request-code` creates the sign-up and shows the code field.
- `complete` verifies the code, finalizes the sign-up, and reports an active session.

## How to get to it (user POV)

- Launch `verifyScreen customSignUp`. The screen has email and password fields, `Send code`, then a code field and `Verify code`.

## Driving it with verify

Preconditions:

- `with-email-codes` requires a password at sign-up. The spec uses `Verify-<runId>-Pw1!`.
- The spec reserves a new `+clerk_test` address with `host.newEmail`, so `.claude/skills/verify-clerk-expo/bin/control-clerk-expo down` can delete the user the form creates.

- **Request the code.** Run `.claude/skills/verify-clerk-expo/bin/control-clerk-expo run custom-flow-sign-up/request-code`. The spec fills `verify.customSignUp.emailAddress` and `verify.customSignUp.password`, taps `verify.customSignUp.sendCode`, expects `verify.customSignUp.code`, and waits for `signUpStatus` `missing_requirements`. Screenshot `custom-signup-code`.
- **Enter the code.** Run `.claude/skills/verify-clerk-expo/bin/control-clerk-expo run custom-flow-sign-up/complete` (tag `form-entry`). It types `CLERK_TEST_CODE`, taps `verify.customSignUp.verifyCode`, and waits for an active session. Screenshots `custom-signup-code` and `custom-signed-up`.
- **Proof.** `states.jsonl` shows `signUpStatus` moving to `complete` and a non-null `userId`.

## Gotchas

- Never type an address that `host.newEmail` did not return. Cleanup finds form-created users only by their reserved email.
- The request-code spec leaves an unfinished sign-up. Clerk expires it, and it creates no user.
