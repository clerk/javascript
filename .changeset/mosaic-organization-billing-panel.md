---
'@clerk/ui': minor
---

Add a Mosaic `OrganizationProfile.BillingPanel` to the organization profile Mosaic namespace, along with its Subscriptions, Account Credits, Statements, and Payments sections and the Statement and Payment Attempt detail screens (also exposed as `OrganizationProfile.BillingSubscriptionsSection`, `OrganizationProfile.BillingAccountCreditsSection`, `OrganizationProfile.BillingStatementsSection`, `OrganizationProfile.BillingPaymentsSection`, `OrganizationProfile.BillingStatementDetail`, and `OrganizationProfile.BillingPaymentDetail`). This is additive and backwards-compatible: no existing public API is changed or removed, and the legacy organization billing page is untouched.
