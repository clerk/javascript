---
'@clerk/ui': patch
---

Prevent duplicate SSO activation requests and clear row loading state when a connection row closes. Ignore late errors from closed rows so they do not affect a replacement row.
