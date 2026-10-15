---
'@clerk/mosaic': patch
---

Add `Reveal`, which shows and hides its children with a height animation. Children mount when it opens and unmount once it has closed, hold their last content and are inert while closing, and appear without an entrance when it mounts already open.
