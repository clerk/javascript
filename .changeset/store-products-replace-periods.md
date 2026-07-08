---
'@clerk/expo': minor
'@clerk/shared': minor
'@clerk/clerk-js': patch
---

A plan can now map any number of app store products per store, and the store's own renewal term governs billing. `BillingPlanStoreProduct` no longer carries a `period`. `useIAPBilling().purchase(plan, period)` becomes `purchase(plan, options?)`: with a single mapped product for the platform's store no options are needed; with several, pass `options.productId` to choose (omitting it throws the new `ambiguous_store_product` error naming the candidates).
