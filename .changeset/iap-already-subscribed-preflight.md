---
'@clerk/expo': patch
'@clerk/clerk-js': patch
'@clerk/shared': patch
---

`useIAPBilling()` now guards against double-subscribing before the store charges the user: `purchase()` resolves to `{ status: 'already_subscribed', alreadySubscribedVia }` without opening the payment sheet when the user already holds an active paid subscription through a different processor than the current platform's store, and the hook exposes `alreadySubscribedVia` (`'stripe' | 'apple' | 'google' | null`) so paywalls can suppress the purchase affordance up front. Immediately before opening the native payment sheet, the SDK also calls Clerk's server preflight to validate fresh subscription state, the active store connection, and the exact product mapping.
