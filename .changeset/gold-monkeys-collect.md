---
'@clerk/clerk-js': patch
'@clerk/nextjs': patch
'@clerk/types': patch
---

Introduce `__internal_copyInstanceKeysUrl` as property in `ClerkOptions`. It is intented for internall usage from other Clerk SDKs and will be used in Keyless mode.
