---
title: 'Deprecated verify methods removed from `@clerk/backend`'
packages: ['backend']
matcher:
  - 'verifySecret'
  - 'verifyAccessToken'
  - 'verifyToken'
category: 'deprecation-removal'
---

The deprecated `verifySecret()`, `verifyAccessToken()`, and `verifyToken()` methods have been removed. Use `verify()` instead.

```diff
- await clerkClient.apiKeys.verifySecret(secret);
+ await clerkClient.apiKeys.verify(secret);

- await clerkClient.idpOAuthAccessToken.verifyAccessToken(accessToken);
+ await clerkClient.idpOAuthAccessToken.verify(accessToken);

- await clerkClient.m2m.verifyToken(params);
+ await clerkClient.m2m.verify(params);
```
