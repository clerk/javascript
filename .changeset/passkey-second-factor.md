---
'@clerk/shared': minor
'@clerk/clerk-js': minor
'@clerk/ui': minor
'@clerk/localizations': minor
'@clerk/react': minor
---

Support passkeys as a second factor during sign-in and session reverification. When the instance allows passkeys to satisfy the second factor and the user has a registered passkey, FAPI advertises a `passkey` entry in `supported_second_factors`; `signIn.authenticateWithPasskey()` now completes the second factor of an in-progress sign-in that offers it (and falls back to the first-factor flow when it doesn't, as on older clients), `session.verifyWithPasskey({ level: 'second_factor' })` completes a multi-factor reverification (any other `level` value is rejected), the `signIn.mfa.passkey()` future API is exposed through `@clerk/react`, and the prebuilt `<SignIn/>` and `<UserVerification/>` flows offer the passkey alongside the enrolled second factors.
