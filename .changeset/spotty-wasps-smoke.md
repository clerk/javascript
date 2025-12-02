---
'@clerk/backend': minor
---

Unified machine token verification methods under a consistent `verify()` API. The previous methods (`verifySecret`, `verifyToken`, `verifyAccessToken`) are now deprecated.

Before

```ts
await clerkClient.apiKeys.verifySecret('ak_...');
await clerkClient.m2m.verifyToken({ token: 'mt_...' });
```

After

```ts
await clerkClient.apiKeys.verify('ak_...');
await clerkClient.m2m.verify({ token: 'mt_...' });
```
