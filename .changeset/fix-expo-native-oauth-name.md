---
'@clerk/expo': patch
---

Fix `useSignInWithApple` and `useSignInWithGoogle` dropping the user's first and last name on native sign-up. The hooks now default to sign-up-first (passing the name from the Apple/Google credential), falling back to sign-in-with-transfer only when the account already exists, matching clerk-ios's behavior.
