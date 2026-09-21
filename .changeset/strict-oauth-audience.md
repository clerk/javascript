---
'@clerk/backend': major
---

When a non-empty `audience` is set, OAuth access tokens must have a valid `aud` with at least one matching value. This check is new for opaque tokens. OAuth JWTs already rejected valid but mismatched audiences; they now also reject missing or malformed `aud` claims. `idPOAuthAccessToken.verify()` now accepts an optional `{ audience }`. Without it, the SDK skips the audience check. Session and M2M verification are unchanged.
