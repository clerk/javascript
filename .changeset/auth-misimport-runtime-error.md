---
"@clerk/nextjs": patch
---

Improved error message when `auth` is accidentally imported from `@clerk/nextjs` instead of `@clerk/nextjs/server`. Previously, bundlers would show a generic `'auth' is not exported` error. Now, a clear runtime error points developers to the correct import path.
