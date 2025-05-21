---
'@clerk/backend': minor
'@clerk/express': minor
---

Introduce `treatPendingAsSignedOut` option to `getAuth`

```ts
// `pending` sessions will be treated as signed-out by default
const { userId } = getAuth(req)
```

```ts
// Both `active` and `pending` sessions will be treated as authenticated when `treatPendingAsSignedOut` is false
const { userId } = getAuth(req, { treatPendingAsSignedOut: false })
```
