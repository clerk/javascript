---
'@clerk/ui': minor
---

Add a download action to the payment receipt (payment attempt) page in the `<UserProfile />` and `<OrganizationProfile />` billing sections. Payers can now save a receipt as a PDF through the browser's print dialog instead of digging through their email. The downloaded receipt mirrors the emailed billing receipt (plan, seats, proration, credits, totals, payment details). Adds a new `paymentAttemptDownloadButton` appearance element for customization.
