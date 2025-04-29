---
'@clerk/nextjs': patch
---

Introduce `treatPendingAsSignedOut` to `auth` and server-side control components

```ts
const { userId } = auth({ treatPendingAsSignedOut: false })
```

```tsx
<SignedIn treatPendingAsSignedOut={false}>
  User has a session that is either pending (requires tasks resolution) or active
</SignedIn>
```
