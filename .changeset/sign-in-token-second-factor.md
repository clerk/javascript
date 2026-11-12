---
'@clerk/backend': minor
---

Add an optional `secondFactorVerification` parameter (`'fresh' | 'stale'`) to `createSignInToken()`, which lets a user with a second factor enabled complete the sign-in without being prompted for it. `expiresInSeconds` is now optional.
