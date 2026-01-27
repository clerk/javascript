---
'@clerk/clerk-js': minor
---

Add proactive session token refresh. Tokens are now automatically refreshed in the background before they expire. The `leewayInSeconds` option controls how far in advance refresh is triggered (default: 15 seconds, minimum: 5 seconds).
