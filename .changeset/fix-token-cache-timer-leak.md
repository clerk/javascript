---
'@clerk/clerk-js': patch
---

Fix token cache refresh timer leak that caused accelerating token refresh requests after `session.touch()` or organization switching.
