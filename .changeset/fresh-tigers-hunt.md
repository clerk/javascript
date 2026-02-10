---
'@clerk/clerk-js': major
---

Add proactive session token refresh. Tokens are now automatically refreshed in the background before they expire, reducing latency for API calls near token expiration.
