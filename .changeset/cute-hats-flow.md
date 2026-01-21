---
"@clerk/shared": patch
---

Fix Stripe elements not loading by removing the `billingEnabled` gate from `useStripeClerkLibs` that was inadvertently added during SWR removal
