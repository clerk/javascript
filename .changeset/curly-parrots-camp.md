---
'@clerk/clerk-expo': minor
---

Use `base-64` package for Expo instead of the isomorphic from `@clerk/shared` due to errors about `Maximum call stack size exceeded` on `global.Buffer`
