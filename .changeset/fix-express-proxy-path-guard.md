---
'@clerk/express': patch
---

Fix empty path fallback for `frontendApiProxy` to prevent intercepting all requests when `path` resolves to an empty string
