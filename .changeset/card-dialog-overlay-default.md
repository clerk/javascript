---
'@clerk/mosaic': patch
---

A `Card.Root` inside a `Dialog.Popup` now defaults to `elevation='overlay'`, so dialog cards no longer need to set it. Cards outside a dialog still default to `'card'`, and an explicit `elevation` still wins.
