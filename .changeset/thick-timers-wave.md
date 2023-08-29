---
'@clerk/clerk-js': patch
---

Disable chunking for `@clerk/clerk-js/headless` to ensure the library doesn't attempt to dynamically load chunks in a non-browser environment.
