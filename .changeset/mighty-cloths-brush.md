---
'@clerk/clerk-js': patch
---

Fix routing issue in `<Checkout />` component by wrapping the `LazyDrawerRenderer` with nested `VirtualRouter`.
