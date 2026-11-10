---
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/react': minor
---

Add `clientTrustState` to `SignInFuture`, so custom sign-in flows can read whether Clerk recognizes the user's device (`'new'`, `'known'`, or `'pending'`). It's `undefined` when the instance reports Device Trust through the `needs_client_trust` status instead.
