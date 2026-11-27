---
'@clerk/ui': patch
'@clerk/clerk-js': patch
'@clerk/shared': patch
---

Highlight ChatGPT as the primary sign-in option when a ChatGPT plugin starts a Clerk authorization flow, and pass the plugin's prompt and login hint to ChatGPT.

Add an optional `oidcLoginHint` parameter to `signIn.authenticateWithRedirect()`, `signIn.authenticateWithPopup()`, `signIn.sso()`, `signUp.authenticateWithRedirect()`, and `signUp.authenticateWithPopup()`. Clerk sends it to the OAuth provider as the OIDC `login_hint`, including when the call continues an existing sign-in attempt.
