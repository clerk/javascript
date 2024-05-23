---
'@clerk/nextjs': patch
---

Utilize an awaitable replace function internally to avoid race conditions when using `router.replace`.
