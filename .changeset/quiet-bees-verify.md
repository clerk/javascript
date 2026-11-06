---
'@clerk/mosaic': patch
---

Reuse an unexpired verification code when switching back to the same email address or phone number without attempting another verification method. Returning to a code preserves its resend countdown, and pending code sends finish before another method is prepared or submitted.
