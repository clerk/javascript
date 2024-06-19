---
"@clerk/nextjs": patch
---

Makes the internally used `invalidateCacheAction()` server action an async function to comply with server actions constraints. More information: https://nextjs.org/docs/messages/invalid-use-server-value
