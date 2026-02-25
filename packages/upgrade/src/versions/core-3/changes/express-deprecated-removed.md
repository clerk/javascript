---
title: 'Deprecated `enableHandshake` option and `req.auth` object-access removed from `@clerk/express`'
packages: ['express']
matcher:
  - 'enableHandshake'
  - 'req\.auth\.'
category: 'deprecation-removal'
---

**`enableHandshake` option removed**

The `enableHandshake` option had no effect and has been removed from `clerkMiddleware`.

```diff
- app.use(clerkMiddleware({ enableHandshake: false }));
+ app.use(clerkMiddleware());
```

**`req.auth` object-access removed**

Accessing `req.auth` as a plain object (legacy `clerk-sdk-node` style) is no longer supported. Use `getAuth()` instead.

```diff
- const { userId } = req.auth;
+ const { userId } = getAuth(req);
```
