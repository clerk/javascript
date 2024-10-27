---
"@clerk/tanstack-start": patch
---

Fix Tanstack Start SSR

- Stop overwriting default router context
- Stop unnecessarily re-running route loaders
