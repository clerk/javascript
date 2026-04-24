---
"@clerk/express": patch
---

Support dynamic options callback in `clerkMiddleware`:

Usage:

```ts
app.use(clerkMiddleware((req) => ({
 publishableKey: req.hostname === 'example.com' ? PK_A : PK_B,
 secretKey: req.hostname === 'example.com' ? SK_A : SK_B,
})));
```
