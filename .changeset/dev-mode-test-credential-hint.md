---
'@clerk/ui': patch
---

Add a development-mode hint to the sign-in and sign-up email/phone fields that nudges developers toward Clerk test credentials. Focusing the field reveals an inline "Use test email" or "Use test number" button inside the input; clicking it inserts a suggested test identifier (verify it on the next screen with the code `424242`). The hint only appears in development and stays visible until the field holds a valid test credential.
