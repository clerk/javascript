---
'@clerk/ui': patch
---

Fix the `Subtotal` row in the payment attempt details view to read from `paymentAttempt.totals.subtotal` so it matches the value shown in the Clerk Dashboard. Previously it rendered `subscriptionItem.amount` which caused the displayed subtotal to disagree with the dashboard.
