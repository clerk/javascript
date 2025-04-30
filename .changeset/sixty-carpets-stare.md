---
'@clerk/astro': patch
---

Introduce `treatPendingAsSignedOut` option to `getAuth` and `auth` from `clerkMiddleware`

```ts
const { userId } = getAuth(req, locals, { treatPendingAsSignedOut: false })
```

```ts
clerkMiddleware((auth, context) => {
  const { redirectToSignIn, userId } = auth({ treatPendingAsSignedOut: false })

  // Both `active` and `pending` sessions will be treated as authenticated when `treatPendingAsSignedOut` is false
  if (!userId && isProtectedRoute(context.request)) {
    return redirectToSignIn()
  }
})
```
