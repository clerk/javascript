---
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/expo': minor
---

Add experimental in-app purchase (IAP) billing support for Expo apps. The new `useIAPBilling()` hook (exported from `@clerk/expo/experimental`) purchases Clerk Billing plans through the Apple App Store or Google Play via the optional `expo-iap` peer dependency, registers the purchase with Clerk, and refreshes the session so new feature claims are live immediately. It also supports restoring purchases and registering out-of-band transactions (renewals, promo codes). Under the hood, `clerk.billing.registerStorePurchase()` registers a store purchase payload with Clerk, and `ClerkAPIError.meta` now surfaces `alreadySubscribedVia` when a purchase is rejected with the `already_subscribed` error code.
