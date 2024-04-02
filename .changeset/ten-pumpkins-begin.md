---
'@clerk/clerk-js': patch
---

Ensures we don't attempt to access `window.addEventListener()` in non-browser environments.
