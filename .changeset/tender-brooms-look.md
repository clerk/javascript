---
'@clerk/nextjs': minor
---

Introduce `treatPendingAsSignedOut` option to `getAuth` and `auth` from `clerkMiddleware`

By default, `treatPendingAsSignedOut` is set to `true`, which means pending sessions are treated as signed-out. You can set this option to `false` to treat pending sessions as authenticated.

```ts
const { userId } = auth({ treatPendingAsSignedOut: false })
```

```ts
const { userId } = getAuth(req, { treatPendingAsSignedOut: false })
```

```tsx
<SignedIn treatPendingAsSignedOut={false}>
  User has a session that is either pending (requires tasks resolution) or active
</SignedIn>
```
