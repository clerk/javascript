---
'@clerk/shared': patch
---

Declare `@clerk/shared` as side-effect-free (`"sideEffects": false`) so bundlers can tree-shake unused exports from the package.
