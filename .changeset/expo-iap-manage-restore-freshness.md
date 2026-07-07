---
'@clerk/expo': minor
---

Several improvements to the experimental `useIAPBilling()` hook:

- New `manageSubscriptions()` method that opens the store's own subscription management surface: the native StoreKit manage-subscriptions sheet on iOS, the Google Play subscriptions screen on Android, with a fallback to the store's subscriptions web URL. Use it to handle "cancel my subscription" for store-managed subscriptions, which can only be cancelled in the store itself. Failures throw an `IAPBillingError` with the new `manage_subscriptions_failed` code.
- `restorePurchases()` (and out-of-band store transactions such as renewals) now registers purchases with `source: 'restore'`, so a store subscription bound to a different user is transferred to the current user instead of the registration being rejected. `restorePurchases()` also always refreshes billing state, even when no purchases were registered.
- Billing state now stays fresh automatically: it is refetched when the app returns to the foreground (throttled) and when a session token refresh delivers changed entitlement claims. `loading` now only reflects the initial load; automatic refreshes revalidate silently instead of blanking the UI, and successful purchases update `currentSubscriptionItems` immediately from the registration response.
- Fixed an unhandled promise rejection when a failed store purchase was reported through both the purchase-error event and the `requestPurchase()` rejection.
