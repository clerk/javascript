---
'@clerk/clerk-sdk-node': minor
'@clerk/backend': minor
---

Add missing `createdAt` param in `User#createUser()` of `@clerk/backend`.
Fix `clerkClient.verifyToken()` signature to support a single `token: string` parameter.