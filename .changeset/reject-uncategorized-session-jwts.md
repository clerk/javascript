---
'@clerk/backend': minor
---

JWTs without a `cat` header are no longer accepted as session tokens: `authenticateRequest()` returns signed out (`token-type-mismatch`) and `verifyToken()` returns `token-invalid`. This includes OIDC `id_token`s issued by Clerk. Tests that sign their own session tokens must add `cat: 'cl_B7d4PD111AAA'` to the header.
