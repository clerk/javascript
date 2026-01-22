---
"@clerk/backend": patch
---

Add optional `idToken` member to `OauthAccessToken` returned by `getUserOauthAccessToken`. The ID token is retrieved from OIDC providers and is only present for OIDC-compliant OAuth 2.0 providers when available.
