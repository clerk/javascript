---
title: '`enableHandshake` option removed from `clerkMiddleware`'
packages: ['express']
matcher: 'enableHandshake'
category: 'deprecation-removal'
---

The `enableHandshake` option has been removed from `clerkMiddleware`. Handshake is now always enabled and this option had no effect.

```diff
- app.use(clerkMiddleware({ enableHandshake: false }));
+ app.use(clerkMiddleware());
```
