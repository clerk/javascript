---
"@clerk/astro": patch
---

Simplify submodules and drop the `bunlded` variant.

Moved 
- `@clerk/astro/client/react` to `@clerk/astro/react`
- `@clerk/astro/client/stores` to `@clerk/astro/client`
Dropped
- `@clerk/astro/bundled`
- `@clerk/astro/client/bundled`
- `@clerk/astro/internal/bundled`
- `@clerk/astro/integration`
- `@clerk/astro/integration/bundled`
