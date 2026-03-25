---
'@clerk/expo': patch
---

Add `appleSignIn` option to the Expo config plugin. Setting `appleSignIn: false` prevents the Sign in with Apple entitlement from being added unconditionally, allowing apps that do not use Apple Sign In to opt out.
