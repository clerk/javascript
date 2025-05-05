---
'@clerk/astro': minor
---

Introduce `treatPendingAsSignedOut` option to `getAuth` and `auth` from `clerkMiddleware`

By default, `treatPendingAsSignedOut` is set to `true`, which means pending sessions are treated as signed-out. You can set this option to `false` to treat pending sessions as authenticated.

```ts
// `pending` sessions will be treated as signed-out by default
const { userId } = getAuth(req, locals)
```

```ts
// Both `active` and `pending` sessions will be treated as authenticated when `treatPendingAsSignedOut` is false
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
