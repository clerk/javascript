---
'@clerk/expo': minor
---

Surface Android Google Sign-In provider failures instead of silently treating them as a cancelled sign-in.

Android's Credential Manager reports failures such as an unregistered OAuth client through the same cancellation exception it uses for a dismissed account chooser, so `startGoogleAuthenticationFlow()` resolved with no session and no error. Those failures now reject with a `GOOGLE_SIGN_IN_ERROR`, while dismissing the chooser still resolves with `createdSessionId: null`.

If you call `startGoogleAuthenticationFlow()` without a `try`/`catch`, add one to handle the rejection.
