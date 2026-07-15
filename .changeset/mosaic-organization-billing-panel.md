---
'@clerk/ui': minor
---

Add a Mosaic `OrganizationProfile.BillingPanel` to the organization profile Mosaic namespace, along with its Subscriptions, Payment Methods, Account Credits, Statements, and Payments sections and the Statement and Payment Attempt detail screens (also exposed as `OrganizationProfile.BillingSubscriptionsSection`, `OrganizationProfile.BillingPaymentMethodsSection`, `OrganizationProfile.BillingAccountCreditsSection`, `OrganizationProfile.BillingStatementsSection`, `OrganizationProfile.BillingPaymentsSection`, `OrganizationProfile.BillingStatementDetail`, and `OrganizationProfile.BillingPaymentDetail`). This is additive and backwards-compatible: no existing public API is changed or removed, and the legacy organization billing page is untouched.

The `BillingPanel` self-gates on billing permissions: it renders nothing for members who can neither read nor manage billing (`org:sys_billing:read`/`org:sys_billing:manage`) or when organization billing is disabled, matching the legacy organization billing page.

The Mosaic Payment Methods section adds, lists, removes, and re-defaults payment methods. Note: the card-entry step of the add flow (the payment provider's remotely-hosted element) is not rendered in the Mosaic panel and remains on the legacy billing page, so the add entry point is hidden in builds without remotely-hosted components.
