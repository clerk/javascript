---
'@clerk/ui': minor
'@clerk/react': minor
'@clerk/vue': minor
'@clerk/astro': minor
'@clerk/chrome-extension': minor
'@clerk/shared': minor
---

Add `ui` prop to ClerkProvider for UI version pinning

The `ui` object from `@clerk/ui` is passed to ClerkProvider to pin the UI version loaded from CDN. Each SDK decides internally whether to use the bundled constructor (`ui.ctor`) or load from CDN.

**Breaking Change (internal):** `clerkUiCtor` is no longer exposed in `IsomorphicClerkOptions`. SDKs should use `ui` prop instead.

**SDK Behavior:**
- Chrome Extension: Uses bundled UI (`__internal_forceBundledUI: true`)
- React/Next.js, Vue, Astro: Load from CDN with version pinning via `ui.version`

Usage:
```tsx
import { ui } from '@clerk/ui';

<ClerkProvider ui={ui}>
  ...
</ClerkProvider>
```
