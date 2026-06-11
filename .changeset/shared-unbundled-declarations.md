---
'@clerk/shared': patch
---

Restore resolvable TypeScript declarations. Type declarations are now emitted per-module at stable public paths instead of being bundled into content-hashed internal chunk files. This fixes type resolution failures (or silent `any` degradation) in packages whose declarations reference `@clerk/shared` types, such as `@clerk/vue`, `@clerk/react`, `@clerk/ui`, and `@clerk/testing`, which previously pointed at unresolvable `@clerk/shared/_chunks/*` specifiers.
