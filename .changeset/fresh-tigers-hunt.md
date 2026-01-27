---
'@clerk/clerk-js': minor
'@clerk/shared': minor
---

Add proactive session token refresh. Tokens are now automatically refreshed in the background before they expire, eliminating the need for manual refresh configuration.

Remove `leewayInSeconds` from `GetTokenOptions`. Token refresh timing is now handled automatically.
