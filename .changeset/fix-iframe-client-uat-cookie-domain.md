---
'@clerk/clerk-js': patch
---

Fix `__client_uat` cookie being set on two different domain scopes when app is loaded in both iframe and non-iframe contexts. `getCookieDomain()` now falls back to `hostname` instead of `undefined` when the eTLD+1 probe fails, preventing host-only cookies that conflict with domain-scoped cookies.
