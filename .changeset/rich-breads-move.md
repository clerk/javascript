---
'@clerk/clerk-js': minor
'@clerk/shared': patch
'@clerk/types': minor
---

[Billing Beta] Rename payment source to payment method.

`Clerk.user.initializePaymentSource()` -> `Clerk.user.initializePaymentMethod()`
`Clerk.user.addPaymentSource()` -> `Clerk.user.addPaymentMethod()`
`Clerk.user.getPaymentSources()` -> `Clerk.user.getPaymentMethods()`

`Clerk.organization.initializePaymentSource()` -> `Clerk.organization.initializePaymentMethod()`
`Clerk.organization.addPaymentSource()` -> `Clerk.organization.addPaymentMethod()`
`Clerk.organization.getPaymentSources()` -> `Clerk.organization.getPaymentMethods()`

