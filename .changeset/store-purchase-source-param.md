---
'@clerk/clerk-js': patch
'@clerk/shared': minor
---

Add an optional `source` parameter (`'purchase' | 'restore'`) to `clerk.billing.registerStorePurchase()`. Passing `source: 'restore'` marks the registration as a store-driven replay: when the store transaction is bound to a different user, the subscription is transferred to the current user instead of the registration being rejected. Omitting the parameter keeps the existing strict purchase semantics.
