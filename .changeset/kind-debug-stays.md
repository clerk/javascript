---
'@clerk/backend': patch
---

Fix `debug()` returning empty values on the auth object you get back when a request's token type doesn't match `acceptsToken`. It now returns the same redacted debug data as the original auth object.
