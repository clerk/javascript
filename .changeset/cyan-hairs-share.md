---
'@clerk/clerk-js': patch
'@clerk/backend': patch
---

Uses the helper function `__experimental_JWTPayloadToAuthObjectProperties` from `@clerk/shared` to handle the new JWT v2 schema.
