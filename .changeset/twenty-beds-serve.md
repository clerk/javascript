---
'@clerk/backend': minor
'@clerk/nextjs': minor
---

- Optimize `auth()` calls to avoid unnecessary verification calls when the provided token type is not in the `acceptsToken` array.
- Add handling for invalid token types when `acceptsToken` is an array in `authenticateRequyest()`: now returns a clear unauthenticated state (`tokenType: null`) if the token is not in the accepted list.

