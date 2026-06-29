---
'@clerk/backend': patch
---

M2M JWT verification now validates the token-category (`cat`) header and rejects M2M JWTs tagged as a different token class. M2M JWTs minted by Clerk carry the correct category and are unaffected; M2M JWTs without the header continue to verify.
