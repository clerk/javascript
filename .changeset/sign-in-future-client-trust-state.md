---
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/react': minor
---

Add `clientTrustState` to `SignInFuture`, so custom sign-in flows can read whether Clerk trusts the user's device (`'new'`, `'known'`, or `'pending'`). With the Device Trust Status update, Clerk returns it once the first factor, such as the password, is verified, and it's `undefined` before then. Without that update, Clerk returns it on every response. It's `undefined` when Device Trust is off.
