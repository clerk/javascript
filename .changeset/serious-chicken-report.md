---
"@clerk/backend": minor
---

Rename M2M namespace from `m2mTokens` to `m2m` in Backend API client

Before:

```ts
clerkClient.m2mTokens.create()

clerkClient.m2mTokens.revoke()

clerkClient.m2mTokens.verifySecret({ secret: 'ak_xxx' })
```

After:

```ts
clerkClient.m2m.createToken()

clerkClient.m2m.revokeToken()

clerkClient.m2m.verifyToken({ token: 'ak_xxx' })
```

The `verifySecret()` method is removed. Please use `.verifyToken()` instead.
