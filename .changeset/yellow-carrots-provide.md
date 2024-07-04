---
"@clerk/nextjs": patch
---

Fixes Next.js build warnings (https://github.com/clerk/javascript/issues/3660) where `AsyncLocalStorage` and `MessageEvent` were being imported as Node.js modules on the edge runtime.
