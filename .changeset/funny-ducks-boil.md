---
'@clerk/clerk-js': minor
'@clerk/types': minor
---

Convert date properties from number to Date in CommerceSubscriptionResource
Deprecates fields of type `number`
- subscription.periodStart
- subscription.periodEnd
- subscription.canceledAt
Introduces fields of type `Date`
- subscription.periodStartDate
- subscription.periodEndDate
- subscription.canceledAtDate
- subscription.createdAt
