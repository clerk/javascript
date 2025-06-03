---
'@clerk/backend': patch
'@clerk/nextjs': patch
'@clerk/astro': patch
---

Introduce `getAuthObjectFromJwt` as internal utility function that centralizes the logic for generating auth objects from session JWTs.
