---
'@clerk/clerk-js': minor
'@clerk/clerk-react': minor
'@clerk/types': minor
---

Expose Clerk Billing APIs.

## Render the pricing table component
- `Clerk.mountPricingTable`
- `Clerk.unmountPricingTable`

## Manage payment methods
- `Clerk.[user|organization].initializePaymentSource()`
- `Clerk.[user|organization].addPaymentSource()`
- `Clerk.[user|organization].getPaymentSources()`

## Billing namespace
- `Clerk.billing`
  - `Clerk.billing.getPlans()`
  - `Clerk.billing.getSubscriptions()`
  - `Clerk.billing.getInvoices()`
  - `Clerk.billing.startCheckout()`
