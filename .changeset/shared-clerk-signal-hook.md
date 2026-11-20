---
'@clerk/shared': patch
'@clerk/react': patch
---

Move the code behind `useSignIn()`, `useSignUp()` and `useWaitlist()` that listens for sign-in, sign-up and waitlist updates into `@clerk/shared`, so `@clerk/mosaic` can use it too. No behavior change.
