---
'@clerk/clerk-js': patch
---

Skip `expired_token` retry flow when Session Minter is enabled. When `sessionMinter` is on, the token is sent in the POST body, so the retry-with-expired-token fallback is unnecessary. The retry flow is preserved for non-Session Minter mode.
