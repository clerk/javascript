---
'@clerk/ui': patch
'@clerk/localizations': patch
'@clerk/shared': patch
---

Add a "Sign in as a different account" action to the sign-in two-step verification (second factor) step. This lets a user who reached the 2FA screen with the wrong account (for example, after signing in with the wrong social account) abandon the attempt and return to the sign-in start to sign in again, instead of being stuck with no way out.
