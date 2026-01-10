---
'@clerk/astro': minor
'@clerk/chrome-extension': minor
'@clerk/nextjs': minor
'@clerk/react': minor
'@clerk/shared': minor
'@clerk/ui': minor
'@clerk/vue': minor
---

Unify UI module configuration into a single `ui` prop on `ClerkProvider`. The prop accepts either:
- The `version` export from `@clerk/ui` for hot loading with version pinning
- The `ClerkUI` class constructor from `@clerk/ui` for direct module usage (bundled with your app)

```tsx
// Hot loading with version pinning
import { version } from '@clerk/ui';
<ClerkProvider ui={version} />

// Direct module usage (bundled with your app)
import { ClerkUI } from '@clerk/ui';
<ClerkProvider ui={ClerkUI} />
```

Only legitimate exports from `@clerk/ui` are accepted. The exports are branded with a symbol that is validated at runtime.
