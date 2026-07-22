---
'@clerk/expo': patch
---

Fix `useSignInWithApple` dropping the user's first and last name on native sign-up. Apple only provides the name in the native credential on first authorization (never in the identity token), so the hook now signs up first with the name attached and falls back to sign-in when the account already exists, including on instances with restricted or waitlist sign-up mode.
