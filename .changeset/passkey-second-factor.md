---
'@clerk/shared': minor
'@clerk/clerk-js': minor
'@clerk/ui': minor
'@clerk/localizations': minor
'@clerk/react': minor
---

Support passkeys as a second factor during sign-in and session reverification.

When a user has a passkey, the prebuilt `<SignIn/>` and `<UserVerification/>`
components preselect it as the second factor, as they already do for the first
factor. Other methods stay available under "Use another method".

To use it, your instance must allow passkeys to satisfy the second factor. This
is on by default for instances created after 2026-07-08, and can be turned on
in the Dashboard for older ones. Web apps also need to opt in to the passkey
second factor update in the Dashboard.

If you build a custom flow, `supportedSecondFactors` can now include `passkey`.
Call `signIn.authenticateWithPasskey()` to complete it.

Passkeys are no longer preselected, for either factor, where the SDK reports
that WebAuthn is unavailable (for example, Electron apps without passkey
support enabled).
