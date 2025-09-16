---
'@clerk/clerk-js': patch
'@clerk/shared': patch
---

Bug fix that allowed `useStatements()`, `usePaymentMethods()` and `usePaymentAttempts()` to fire a request when the billing feature was turned off for the instance.
