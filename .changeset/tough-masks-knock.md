---
'@clerk/nextjs': patch
---

Improves the debug log output, and changes the internal behavior to use multiple `console.log()` calls. This will help to avoid any platform logging limitations per call.
