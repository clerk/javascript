---
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/react': minor
---

Add `clientTrustState` to `SignInFuture`, so custom sign-in flows can read whether Clerk trusts the user's device (`'new'`, `'known'`, or `'pending'`). Clerk returns it once the first factor, such as the password, is verified. It's `undefined` before then, and when Device Trust is off.
