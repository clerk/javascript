---
'@clerk/localizations': patch
'@clerk/clerk-js': patch
'@clerk/types': patch
---

Switch to "Payment method" terminology instead of "Payment source".

- Removes `userProfile.__experimental_billingPage.start.headerTitle__paymentSources`
- Adds `userProfile.__experimental_billingPage.start.headerTitle__paymentMethods`
