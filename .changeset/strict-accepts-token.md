---
'@clerk/backend': patch
---

`authenticateRequest()` now logs a warning when `acceptsToken` is set to an invalid value. A future major version will throw an error instead.
