---
'@clerk/backend': patch
---

Scope the JWKS cache per Clerk instance. The cache was keyed on the JWT `kid` alone and shared across the whole process, so an application verifying tokens for more than one Clerk instance (for example the Dynamic Keys / multi-tenant pattern) could resolve a signing key that was fetched for a different instance. Keys are now cached separately per secret key and API URL, so a token can only be verified against the instance whose credentials fetched its signing key.

The `jwk-kid-mismatch` error message no longer lists the key IDs currently held in the cache.
