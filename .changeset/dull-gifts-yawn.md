---
"@clerk/clerk-react": patch
"@clerk/remix": patch
"@clerk/shared": patch
---

Make `types` the first key in all `exports` keys defined in our packages. The TypeScript docs (https://www.typescriptlang.org/docs/handbook/esm-node.html#packagejson-exports-imports-and-self-referencing) recommends so, as the the "exports" field is order-based.
