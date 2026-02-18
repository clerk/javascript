---
'@clerk/clerk-js': patch
---

Fix `__client_uat` cookie being set on two different domain scopes when app is loaded in both iframe and non-iframe contexts.
