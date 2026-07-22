---
'@clerk/expo': patch
---

Fix `useSignInWithApple` dropping the user's first and last name on native sign-up. The hook now signs up first with the name from the Apple credential and falls back to sign-in when the account already exists, including on instances with restricted or waitlist sign-up mode.
