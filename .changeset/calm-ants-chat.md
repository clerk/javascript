---
'@clerk/ui': patch
'@clerk/clerk-js': patch
'@clerk/shared': patch
---

Highlight ChatGPT as the primary sign-in option when a ChatGPT plugin starts a Clerk authorization flow, and pass the plugin's prompt and login hint to ChatGPT.

Add an optional `oidcLoginHint` parameter to `signIn.authenticateWithRedirect()`, `signIn.authenticateWithPopup()`, and `signIn.sso()` that is sent to the OAuth provider as the OIDC `login_hint` when the method creates the sign-in attempt.
