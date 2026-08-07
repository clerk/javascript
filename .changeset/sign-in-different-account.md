---
'@clerk/ui': patch
---

Add a "Back" action to the sign-in two-step verification (second factor) and client-trust (new-device verification) steps. This lets a user who reached one of these screens with the wrong account, or who cannot complete the required verification (for example, after signing in with the wrong social account), abandon the attempt and return to the sign-in start to sign in again, instead of being stuck with no way out.
