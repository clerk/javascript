---
'@clerk/ui': patch
---

Fix pressing `Escape` while a `Select` is open inside a `Drawer` (for example the payment method picker in Checkout) dismissing the entire Drawer. `Escape` now closes only the open `Select` and leaves the Drawer open. The `Select` now wires up its floating interaction props so it handles `Escape` itself, and the `Drawer` roots a floating tree so nested floating elements are recognized as its children.
