---
"@clerk/shared": patch
---

Fix SyntaxError on non-module imports by dropping support for import.meta (used in vite)
