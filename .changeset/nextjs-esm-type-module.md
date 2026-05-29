---
'@clerk/nextjs': patch
---

Fix ESM resolution under consumers with `"type": "module"`. The package now emits `dist/esm/package.json` with `"type": "module"`, so Node 22+ and tsx no longer treat bundled ESM output as CJS and named imports from `@clerk/nextjs/server` resolve correctly. Closes #8396.
