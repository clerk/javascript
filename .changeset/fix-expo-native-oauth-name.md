---
'@clerk/expo': patch
---

Fix `useSignInWithApple` dropping the user's first and last name on native sign-up. The hook now signs up first with the name from the Apple credential and falls back to sign-in when the account already exists, including on instances with restricted or waitlist sign-up mode.

Note: Apple only shares the name on the app's first authorization. To verify the fix with an Apple ID that has already signed in to your app, delete the user in the Clerk Dashboard and remove the app's entry under Settings > Sign in with Apple on the device, then sign in again.
