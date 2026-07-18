---
'@clerk/clerk-js': patch
---

Fix `useSignIn()` returning a stale `SignInFuture` after `resetSignIn()`. When the next sign-in attempt starts, the existing instance is now updated in-place rather than replaced, preserving the reference held by active hooks.
