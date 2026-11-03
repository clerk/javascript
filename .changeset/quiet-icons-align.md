---
'@clerk/mosaic': patch
---

`IconFrame` and `Avatar` now share one size scale and set of corner radii: `xs`, `sm`, `md` and `lg` are 24, 32, 40 and 48px. `IconFrame` sizes are now `xs`, `sm`, `md` and `lg` and the default is `md` (40px), replacing `sm`, `md`, `lg` and `xl`. `Avatar` `md` is 40px instead of 38px, square `Avatar` at `md` has a 6px radius instead of 8px, and provider icons in the connected accounts, enterprise accounts and Web3 wallets sections are 16px instead of 20px.
