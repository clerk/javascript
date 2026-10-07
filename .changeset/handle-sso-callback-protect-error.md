---
'@clerk/clerk-js': patch
'@clerk/react': patch
---

Fix `<HandleSSOCallback />` dropping the error when a Clerk Protect challenge fails on the SSO callback. The error is now available on `errors` from `useSignIn()` or `useSignUp()`, and a failed sign-up challenge calls `navigateToSignUp` instead of `navigateToSignIn`.
