---
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/react': minor
---

Add `clientTrustState` to `SignInFuture`, so custom sign-in flows can read whether Clerk trusts the user's device (`'new'`, `'known'`, or `'pending'`). A completed sign-in usually reads `'known'`, so read the value before the sign-in completes to learn whether the device was trusted beforehand. It's `undefined` when Device Trust is off, or before a sign-in attempt exists.
