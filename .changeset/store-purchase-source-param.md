---
'@clerk/clerk-js': patch
'@clerk/shared': minor
---

Add an optional `source` parameter (`'purchase' | 'restore' | 'sync'`) to `clerk.billing.registerStorePurchase()`. Passing `source: 'restore'` marks an explicit user restore that may transfer a purchased subscription to the current user. Passive listener updates use `source: 'sync'`, which keeps strict user binding and never transfers ownership. Omitting the parameter keeps the existing strict purchase semantics.
