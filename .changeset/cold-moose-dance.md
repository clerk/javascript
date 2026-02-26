---
"@clerk/backend": major
---

Remove deprecated verify methods in favor of `verify()`.

**`apiKeys.verifySecret()` removed**

```ts
// Before
await clerkClient.apiKeys.verifySecret(secret);

// After
await clerkClient.apiKeys.verify(secret);
```

**`idpOAuthAccessToken.verifyAccessToken()` removed**

```ts
// Before
await clerkClient.idpOAuthAccessToken.verifyAccessToken(accessToken);

// After
await clerkClient.idpOAuthAccessToken.verify(accessToken);
```

**`m2m.verifyToken()` removed**

```ts
// Before
await clerkClient.m2m.verifyToken(params);

// After
await clerkClient.m2m.verify(params);
```
