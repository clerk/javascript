---
'@clerk/mosaic': patch
'@clerk/shared': patch
---

Keep Web3 wallet action state scoped to the signed-in user and use localized API errors. A failed signature can be retried without removing the unverified wallet first, and immutable wallet settings hide unavailable Connect and Remove actions. Share Solana wallet discovery so only wallets supporting connection and message signing are offered.
