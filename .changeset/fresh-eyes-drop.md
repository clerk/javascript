---
"@clerk/express": major
---

Remove deprecated `enableHandshake` option and `req.auth` object-access pattern.

**`enableHandshake` removed**

This option had no effect and was previously deprecated. Remove it from your `clerkMiddleware` call:

```ts
// Before
app.use(clerkMiddleware({ enableHandshake: false }));

// After
app.use(clerkMiddleware());
```

**`req.auth` must now be called as a function**

Accessing `req.auth` as a plain object (legacy `clerk-sdk-node` style) no longer works. Use `getAuth()` instead:

```ts
// Before
const { userId } = req.auth;

// After
const { userId } = getAuth(req);
```
