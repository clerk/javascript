---
'@clerk/clerk-js': minor
'@clerk/types': minor
---

 [Billing Beta] Cleanup naming inconsistencies in billing dates.

## Migration
- subscriptionItem.periodStartDate → subscriptionItem.periodStart
- subscriptionItem.periodEndDate → subscriptionItem.periodEnd
- subscriptionItem.canceledAtDate → subscriptionItem.canceledAt
