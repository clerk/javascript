---
'@clerk/expo': minor
'@clerk/shared': minor
'@clerk/clerk-js': patch
---

A plan can now map any number of app store products per store, and the store's own product type, purchase option, renewal term, and eligible offers govern the catalog. `BillingPlanStoreProduct` no longer carries a `period` and now preserves Google Play's exact `purchaseOptionId`. `useIAPBilling().purchase(plan, period)` becomes `purchase(plan, options?)`: with a single mapped product for the platform's store no options are needed; with several, pass `options.productId` and, for Google subscriptions with multiple base plans, `options.purchaseOptionId` to choose the exact identity. Google subscription offers follow automatic selection (longest eligible trial, cheapest introductory offer, then base plan), while callers can request a specific eligible offer. Non-subscription products are resolved from the live catalog but fail with `unsupported_product_type` before the native payment sheet until Clerk exposes a matching non-subscription fulfillment model.
