---
'@clerk/clerk-js': patch
---

When requesting Scope information for display in the Consent dialog, a `scope` parameter is now included in the request so that the enumerated scopes will be limited to just those being requested
