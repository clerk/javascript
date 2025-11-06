---
'@clerk/clerk-expo': patch
---

Fix module resolution error for users not using Sign in with Apple. Remove static imports of expo-apple-authentication and expo-crypto, replacing them with dynamic imports that only load when the useSignInWithApple hook is actually called.
