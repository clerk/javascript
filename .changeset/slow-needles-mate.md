---
"@clerk/nextjs": patch
---

Stop throwing "Error: Clerk: auth() was called but Clerk can't detect usage of authMiddleware()." errors when no user action is needed by removing sourcemaps for all Clerk-bundled server actions.
