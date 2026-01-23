---
'@clerk/ui': minor
'@clerk/react': minor
'@clerk/vue': minor
'@clerk/astro': minor
'@clerk/chrome-extension': minor
'@clerk/shared': minor
---

Add `ui` prop to ClerkProvider for UI version metadata

The `ui` object from `@clerk/ui` is passed to ClerkProvider. When `ui.ctor` is available, it will be used for bundled UI; otherwise, the UI is loaded from CDN.

Usage:
```tsx
import { ui } from '@clerk/ui';

<ClerkProvider ui={ui}>
  ...
</ClerkProvider>
```
