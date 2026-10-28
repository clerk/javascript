---
'@clerk/shared': patch
'@clerk/ui': patch
'@clerk/mosaic': patch
---

Move the OAuth consent redirect domain helper into `@clerk/shared` so it can be shared across UI packages. No behavior change.
