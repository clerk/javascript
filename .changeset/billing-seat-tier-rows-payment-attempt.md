---
'@clerk/shared': minor
'@clerk/clerk-js': minor
'@clerk/ui': minor
---

Surface seat-based billing details on payment attempts. The payment attempt resource now exposes a `totals` field (`BillingPaymentTotals`) carrying optional `baseFee` and `perUnitTotals` breakdowns. The payment-attempt detail page renders a "Seats" line (`{quantity} × {feePerBlock}`, or the tier total for unlimited tiers) between the plan title and subtotal when the subscription item is seat-billed.
