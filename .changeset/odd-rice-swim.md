---
'@clerk/ui': major
---

Removes `simple` theme export from UI package in favor of using the `simple` theme via the appearance prop:

```tsx
<ClerkProvider appearance={{ theme: 'simple' }} />
```
