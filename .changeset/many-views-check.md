---
'@clerk/localizations': minor
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/react': minor
'@clerk/testing': minor
'@clerk/ui': minor
---

Add support for Clerk Billing plans with per-seat costs.

- New invite-to-checkout flow when inviting members while on a plan that uses per-seat costs.
- New localization values to support UI additions.
- Support for the `orgId` and `minSeats` parameters to `getPlans()`.
- Support for the `seatsQuantity` and `priceId` parameters to checkout creation.
- New `totals` field on payments.
- New `availablePrices` field on plans.
- New `nextPayment` field on subscription items.
- New `discounts` field on checkouts.
- Additional fields on `nextPayment` for more granularity.