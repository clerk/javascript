---
'@clerk/mosaic': patch
---

`IconFrame`, `Avatar` and `Item.Media` now share one size scale and set of corner radii. `IconFrame` sizes are now `xs`, `sm`, `md` and `lg` (24, 32, 38 and 48px) and the default is `md`, replacing `sm`, `md`, `lg` and `xl`. Icon frames and avatars in rows are 38px instead of 40px, square `Avatar` at `md` has a 6px radius instead of 8px, and provider icons in the connected accounts, enterprise accounts and Web3 wallets sections are 16px instead of 20px.
