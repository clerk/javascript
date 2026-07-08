---
'@clerk/expo': patch
---

`useIAPBilling()` now guards against double-subscribing before the store charges the user: `purchase()` resolves to `{ status: 'already_subscribed', alreadySubscribedVia }` without opening the payment sheet when the user already holds an active paid subscription through any processor, and the hook exposes `alreadySubscribedVia` (`'stripe' | 'apple' | 'google' | null`) so paywalls can suppress the purchase affordance up front.
