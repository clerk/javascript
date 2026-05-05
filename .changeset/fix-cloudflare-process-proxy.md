---
'@clerk/shared': patch
---

Avoid referencing `process.env` when auto-proxy detection runs in runtimes where `process` is unavailable.
