---
'@clerk/expo': minor
---

Fix `useSignInWithApple` transfer sign-up so `firstName` and `lastName` from the Apple credential (`fullName.givenName` / `fullName.familyName`) are passed to `signUp.create()`.
