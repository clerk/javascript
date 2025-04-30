---
'@clerk/clerk-js': minor
'@clerk/clerk-react': minor
'@clerk/types': minor
---

Expose stable commerce stable apis under `Clerk.commerce`

## Render the pricing table component
- `Clerk.mountPricingTable`
- `Clerk.unmountPricingTable`

## Commerce namespace
- `Clerk.commerce.initializePaymentSource()`
- `Clerk.commerce.addPaymentSource()`
- `Clerk.commerce.getPaymentSources()`
- `Clerk.commerce.billing`
  - `Clerk.commerce.billing.getPlans()`
  - `Clerk.commerce.billing.getSubscriptions()`
  - `Clerk.commerce.billing.getInvoices()`
  - `Clerk.commerce.billing.startCheckout()`
