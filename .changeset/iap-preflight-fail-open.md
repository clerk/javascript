---
'@clerk/expo': patch
---

The in-app purchase preflight no longer blocks purchases when it cannot reach Clerk: network failures, server errors, and Frontend API deployments without the preflight endpoint now proceed to the store payment sheet, with registration remaining the authoritative guard. Definitive rejections (unmapped product, unconfigured store connection) now throw a typed `IAPBillingError` — including the new `store_connection_not_configured` code — instead of a raw API error. User-cancellation detection no longer misclassifies system failures whose message merely contains "cancelled" (for example, `NSURLErrorDomain` -999) as the user dismissing the purchase sheet. After an `already_subscribed` result, route plan changes through `manageSubscriptions()`; the `purchase()` documentation example now shows the current store-product API.
