---
'@clerk/shared': patch
'@clerk/clerk-js': patch
---

Remove `expired_token` retry flow and `MissingExpiredTokenError`. The previous session token is now always sent in the `/tokens` POST body, so the retry-with-expired-token fallback is no longer needed.
