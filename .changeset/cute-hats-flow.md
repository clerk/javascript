---
"@clerk/shared": patch
---

Fix Stripe elements not loading by removing the `billingEnabled` gate from `useStripeClerkLibs`
