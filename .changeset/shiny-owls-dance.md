---
'@clerk/ui': minor
'@clerk/react': minor
'@clerk/vue': minor
'@clerk/astro': minor
'@clerk/chrome-extension': minor
'@clerk/shared': minor
---

Add `ui` prop to ClerkProvider for UI version metadata

The `ui` object from `@clerk/ui` contains version info and the bundled constructor. Each SDK decides whether to use `ui.ctor` based on its support level:
- Chrome Extension: Uses bundled UI via `ui.ctor`
- React/Next.js, Vue, Astro: Uses CDN loading

Usage:
```tsx
import { ui } from '@clerk/ui';

<ClerkProvider ui={ui}>
  ...
</ClerkProvider>
```
