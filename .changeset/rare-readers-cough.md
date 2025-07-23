---
'@clerk/clerk-js': minor
'@clerk/types': minor
---

[Billing Beta] Introduce top level subscription.

Updated `CommerceSubscriptionJSON` to describe the top level subscription and renamed the existing type to `CommerceSubscriptionItemJSON`.
Deprecated `billing.getSubscriptions()` in favour of `billing.getSubscription`. 
