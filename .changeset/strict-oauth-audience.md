---
'@clerk/backend': major
---

OAuth access token verification now requires a matching `aud` when a non-empty `audience` option is configured, for both opaque tokens and JWTs. Tokens with a missing, empty, malformed, or mismatched audience are rejected.

Applications that configure `audience` must issue OAuth tokens with a matching audience before upgrading. Session JWT and M2M token verification behavior is unchanged.
