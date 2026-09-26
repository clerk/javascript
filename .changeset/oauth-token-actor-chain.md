---
'@clerk/backend': minor
---

Verified OAuth access tokens now expose `act`, the RFC 8693 actor chain, when the token was issued by an OAuth 2.0 Token Exchange. It is available on the `IdPOAuthAccessToken` returned for both opaque and JWT access tokens.
