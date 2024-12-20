---
'@clerk/clerk-react': minor
---

Adds support for a `fallback` prop on Clerk's components. This allows rendering of a placeholder element while Clerk's components are mounting. Use this to help mitigate layout shift when using Clerk's components. Example usage:


```tsx
<SignIn fallback={<LoadingSkeleton />} />
```
