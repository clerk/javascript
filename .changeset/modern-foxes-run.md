---
"@clerk/clerk-js": patch
---

Ensure we don't access `window.addEventListener()` and `window.dispatchEvent` in non-browser environments.
