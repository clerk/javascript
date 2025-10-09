---
'@clerk/clerk-js': minor
---

When fetching a new Session token, broadcast the token value to other tabs so they can pre-warm their in-memory Session Token cache with the most recent token.
