---
'@clerk/ui': minor
'@clerk/react': minor
'@clerk/vue': minor
'@clerk/astro': minor
'@clerk/chrome-extension': minor
'@clerk/shared': minor
---

Add `ui` prop to ClerkProvider for passing `@clerk/ui`

Usage:
```tsx
import { ui } from '@clerk/ui';

<ClerkProvider ui={ui}>
  ...
</ClerkProvider>
```

**Migration note**: If you were previously using the internal `clerkUiCtor` prop, migrate to the new `ui` prop by importing `ui` from `@clerk/ui`.
