---
'@clerk/expo': patch
---

`useIAPBilling().purchase()` now reliably resolves to `{ status: 'cancelled' }` when the user dismisses the store purchase sheet, including on iOS where the cancellation arrives wrapped in Expo's native-call rejection (previously surfaced as a `purchase_failed` error).
