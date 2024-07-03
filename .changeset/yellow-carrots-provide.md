---
"@clerk/nextjs": patch
---

Fixes Next.js build issue (https://github.com/clerk/javascript/issues/3660) where `AsyncLocalStorage` was being imported as Node.js module instead of using the global polyfill available for the edge runtime.
