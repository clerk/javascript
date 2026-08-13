---
'@clerk/backend': patch
---

Scope the JWKS cache per Clerk instance. The cache was keyed on the JWT `kid` alone and shared across the whole process, so an application verifying tokens for more than one Clerk instance (for example the Dynamic Keys / multi-tenant pattern) could resolve a signing key that was fetched for a different instance. Keys are now cached separately per secret key and API URL, so a token can only be verified against the instance whose credentials fetched its signing key.

Networkless verification with `jwtKey` had the same flaw: the JWK derived from the PEM was cached by `kid` alone, so a process verifying tokens with different `jwtKey` values could resolve a key derived from another instance's PEM. The JWK is now always derived from the `jwtKey` that was passed in.

The `jwk-kid-mismatch` error message no longer lists the key IDs currently held in the cache.
