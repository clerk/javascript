---
"@clerk/astro": patch
---

Remove dependency `@clerk/clerk-js`.

Since clerk-js is being hotloaded it is unnecessary to keep the npm package as a dependency.
