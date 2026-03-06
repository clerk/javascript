---
'@clerk/clerk-js': patch
'@clerk/shared': patch
---

Fix 429 (rate limited) responses being incorrectly treated as authentication failures, which caused users to be signed out when the API was rate limiting requests. Rate limited responses now trigger a degraded status and retry instead of the unauthenticated flow.
