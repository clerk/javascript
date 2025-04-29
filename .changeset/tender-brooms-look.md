---
'@clerk/nextjs': patch
---

Introduce `treatPendingAsSignedOut` to `auth`, `getAuth` and server-side control components

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
