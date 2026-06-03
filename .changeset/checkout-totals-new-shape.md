---
'@clerk/clerk-js': patch
'@clerk/shared': patch
'@clerk/ui': patch
'@clerk/localizations': patch
---

Update checkout totals to support the new `totals` shape from the API:

- Add `discounts` to `BillingCheckoutTotals` / `BillingCheckoutTotalsJSON`. It exposes a `proration` (a `BillingProrationDiscountDetail` with `amount`, `cycleDaysPassed`, `cycleDaysTotal`, `cyclePassedPercent`) describing the prorated discount applied when adding seats mid-billing-period — i.e. the part of the cycle that has already passed and is not charged — plus a `total` of all discounts.
- Add `totalsDuePerPeriod` / `totals_due_per_period` (`BillingPerPeriodTotals`) with `subtotal`, `baseFee`, `taxTotal`, `grandTotal`, and `perUnitTotals`: the full renewal charge breakdown covering all seats and the base plan fee, as opposed to the top-level totals which now only cover what is actively being purchased in the current checkout.
- Add `totalDuePerPeriod` / `total_due_per_period` (money amount) for backwards compatibility.
- Add `baseFee` / `base_fee` to the top-level totals.
- Parse all new fields in `billingTotalsFromJSON`.
- Render the prorated discount line item in `CheckoutForm` when present.
- Render a renewal subtotal and renewal total section in `CheckoutForm` when `totalsDuePerPeriod` is present.
