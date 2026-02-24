---
'@clerk/backend': patch
---

Fixes a bug where `getAuth()` returns unauthenticated during Next.js Pages Router client-side navigations (such as `_next/data` requests), when the `__client_uat` cookie is missing.
