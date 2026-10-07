---
'@clerk/clerk-js': patch
---

Fix `oidcPrompt` being ignored for OAuth strategies in `signIn.sso()` and `signIn.authenticateWithRedirect()`. The value is now sent when the sign-in is created, so a prompt such as `select_account` reaches the OAuth provider.
