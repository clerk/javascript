---
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/react': minor
---

Add `signUp.reload()` to the sign-up returned by `useSignUp()`. It fetches the latest state of the current sign-up attempt from Clerk and resolves to `{ error }` like the other sign-up methods.
