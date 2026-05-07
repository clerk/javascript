---
"@clerk/nextjs": patch
---

Improved developer experience when `auth` is accidentally imported from `@clerk/nextjs` instead of `@clerk/nextjs/server`. The `auth` export now includes a `@deprecated` JSDoc tag with a clear message guiding developers to the correct import path, visible on hover in IDEs.
