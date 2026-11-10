---
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/react': minor
---

Add `clientTrustState` to `SignInFuture`, so custom sign-in flows can read whether Clerk recognizes the user's device (`'new'`, `'known'`, or `'pending'`). It's `'new'` whenever the status is `needs_client_trust`. On instances that report Device Trust through that status, it's `undefined` at every other status.
