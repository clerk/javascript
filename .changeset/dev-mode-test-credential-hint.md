---
'@clerk/ui': patch
---

Add a development-mode hint to the sign-in and sign-up email/phone fields that nudges developers toward Clerk test credentials. Hovering or focusing the field reveals an info icon next to the label; opening it shows a tip about test identifiers and the `424242` verification code, plus a button that inserts a suggested test email or phone number. The hint only appears in development, on empty fields.
