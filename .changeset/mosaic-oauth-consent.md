---
'@clerk/shared': patch
'@clerk/ui': patch
'@clerk/mosaic': patch
---

Add an `inline` prop to the Mosaic `Skeleton`, which sits a text placeholder inside a line of text. Move the OAuth consent redirect domain helper into `@clerk/shared` so it can be shared across UI packages, with no behavior change.
