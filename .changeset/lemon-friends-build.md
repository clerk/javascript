---
'@clerk/nextjs': patch
---

Accept `treatPendingAsSignedOut` option on `currentUser`

```ts
  // If the session has a `pending` status, user will be `null` default, treated as a signed-out state
  const user = await currentUser()
```

```ts
  // If the session has a `pending` status, `user` will be defined, treated as a signed-in state
  const user = await currentUser({ treatPendingAsSignedOut: false })
```
