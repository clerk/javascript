---
'@clerk/nextjs': patch
---

Fix sign-in and sign-out getting stuck in apps with `cacheComponents`. This happened after a client-side navigation that changed a root param, for example from `/en` to `/sk`.
