---
'@clerk/clerk-js': patch
---

Fix `oidcPrompt` and `oidcLoginHint` being silently dropped from the Frontend API request in `user.createExternalAccount()` and `externalAccount.reauthorize()`. Both parameters were already accepted by the public types but never serialized, so providers such as Google would fall back to their default prompt behavior. They are now sent as `oidc_prompt` and `oidc_login_hint`.
