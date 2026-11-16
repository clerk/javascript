---
'@clerk/backend': patch
---

Add `transactional_email_blocked` to the `ClerkPolicy` reasons of the `email.suppressed` webhook event type. Clerk sends this reason when a queued transactional email is suppressed because sending was blocked for the instance.
