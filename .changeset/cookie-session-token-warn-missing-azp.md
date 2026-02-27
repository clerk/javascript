---
'@clerk/backend': patch
---

Warn when a cookie-based session token is missing the `azp` claim instead of rejecting the token. This prepares consumers for a future version where the `azp` claim will be required.
