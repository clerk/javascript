---
title: '`req.auth` object-access removed in favor of `getAuth()`'
packages: ['express']
matcher: 'req\.auth\.'
category: 'deprecation-removal'
---

Accessing `req.auth` as a plain object (legacy `clerk-sdk-node` style) is no longer supported. Use `getAuth()` instead.

```diff
- const { userId } = req.auth;
+ const { userId } = getAuth(req);
```
