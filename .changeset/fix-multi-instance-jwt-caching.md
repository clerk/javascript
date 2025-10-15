---
'@clerk/backend': patch
'@clerk/shared': patch
---

Fixed JWT public key caching in `verifyToken()` to support multi-instance scenarios. Public keys are now correctly cached per `kid` from the token header instead of using a single shared cache key.

**What was broken:**

When verifying JWT tokens with the `jwtKey` option (PEM public key), all keys were cached under the same cache key. This caused verification failures in multi-instance scenarios.

**What's fixed:**

JWT public keys are now cached using the `kid` value from each token's header.