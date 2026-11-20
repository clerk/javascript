---
'@clerk/nextjs': patch
'@clerk/backend': patch
---

Fix `auth().debug()` in route handlers not redacting its data for requests authenticated with an M2M token, OAuth token or API key. Debug data is now redacted the same way as for session tokens.
