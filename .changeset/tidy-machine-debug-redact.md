---
'@clerk/nextjs': patch
'@clerk/backend': patch
---

Fix `auth().debug()` in route handlers returning the full secret key for requests authenticated with an M2M token, OAuth token or API key. The secret key is now cut to its first 7 characters, the same as for session tokens.
