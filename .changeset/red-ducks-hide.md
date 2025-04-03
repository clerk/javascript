---
'@clerk/astro': patch
'@clerk/clerk-react': patch
'@clerk/vue': patch
---

Introduce `treatPendingAsSignedOut` prop to client control components

```tsx
// Children node only mounts when session is active
// Example: Organization selection must be completed if enforced
<SignedIn>
   <p>You have selected an organization!</p>
</SignedIn>
```
```tsx
// Children node mounts for both active and pending session
<SignedIn treatPendingAsSignedOut={false}>
   <p>You might not have an organization selected</p>
</SignedIn>
```

```tsx
// Children node only mounts when session is active
// Example: Organization selection must be completed if enforced
<Protect>
   <p>You have selected an organization!</p>
</Protect>
```
```tsx
// Children node mounts for both active and pending session
<Protect treatPendingAsSignedOut={false}>
   <p>You might not have an organization selected</p>
</Protect>
```
