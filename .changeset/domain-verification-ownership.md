---
'@clerk/ui': patch
---

Prevent overlapping domain verification requests and ignore late results after the form closes or the active account changes. Resend verification codes to the full email address used for the original request, and show enrollment options with the updated verification status after a successful code attempt.
