---
'@clerk/clerk-js': patch
---

Fix `__client_uat` cookie being set on two different domain scopes when app is loaded in both iframe and non-iframe contexts. `getCookieDomain()` now falls back to `hostname` instead of `undefined` when the eTLD+1 probe fails, and the eTLD+1 probe uses the same `SameSite`/`Secure` attributes as the actual cookie to ensure consistent behavior across contexts.
