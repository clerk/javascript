---
'@clerk/expo': patch
---

`useSignInWithApple` now throws a `ClerkAPIResponseError` when Sign in with Apple on an instance with restricted sign-ups needs the user to verify their email address first. Previously it returned with no session and no error.
