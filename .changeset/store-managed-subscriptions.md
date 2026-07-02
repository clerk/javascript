---
'@clerk/localizations': minor
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/ui': minor
---

Add support for store-managed (Apple App Store / Google Play) subscriptions. Plans now expose the app store products they can be purchased through via `storeProducts`, and subscription items expose `managedBy` to indicate the party that manages their billing lifecycle. Subscription items managed by an app store no longer offer Clerk-side cancellation and instead display a "Managed via App Store" / "Managed via Google Play" indicator.
