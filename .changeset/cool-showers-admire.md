---
'@clerk/nextjs': minor
'@clerk/clerk-react': minor
---

Introduce `useClerk().status` alongside `<ClerkFailed />` and `<ClerkDegraded />`.

### `useClerk().status`
Possible values for `useClerk().status` are:
- `"loading"`: Set during initialization
- `"error"`: Set when hotloading clerk-js failed or `Clerk.load()` failed
- `"ready"`: Set when Clerk is fully operational
- `"degraded"`: Set when Clerk is partially operational
The computed value of `useClerk().loaded` is:

- `true` when `useClerk().status` is either `"ready"` or `"degraded"`.
- `false` when `useClerk().status` is `"loading"` or `"error"`.

### `<ClerkFailed/>`
```tsx
<ClerkLoaded>
  <MyCustomSignInForm/>
</ClerkLoaded>
<ClerkFailed>
  <ContactSupportBanner/>
</ClerkFailed>
```

### `<ClerkDegraded />`
```tsx
<ClerkLoaded>
  <MyCustomPasskeyRegistration/>
  <ClerkDegraded>
    We are experiencing issues, registering a passkey might fail. 
  </ClerkDegraded>
</ClerkLoaded>
```
