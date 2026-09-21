---
'@clerk/backend': minor
---

Enforce audience binding for OAuth access tokens. When `audience` is configured, `authenticateRequest()` with `acceptsToken: 'oauth_token'` (and `verifyMachineAuthToken()`) now returns an unauthenticated state for JWT and opaque tokens whose `aud` is missing or does not include the configured audience. The OAuth auth object additionally exposes the token's `aud` and `act` claims alongside `scopes` and `clientId`. OAuth JWTs can now be verified without a secret key: when only a `publishableKey` is configured, the JWKS is loaded from the Frontend API.
