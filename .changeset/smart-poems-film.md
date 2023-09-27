---
"@clerk/clerk-react": patch
---

Remove nested `package.json` files inside `dist/cjs` and `dist/esm` and move `sideEffects` property to top-level `package.json` file. This change won't change behavior.
