---
'@clerk/nextjs': patch
---

Propagate `treatPendingAsSignedOut` to `auth` from `clerkMiddleware`

```ts
export default clerkMiddleware(async (auth, req) => {
  // If the session has a `pending` status, `userId` will be `null` by default, treated as a signed-out state
  const { userId } = await auth()
})
```

```ts
export default clerkMiddleware(async (auth, req) => {
  // If the session has a `pending` status, `userId` will be defined, treated as a signed-in state
  const { userId } = await auth({ treatPendingAsSignedOut: false })
})
```
