---
'@clerk/clerk-js': patch
---

Reject invalid legacy Android email-link flow states before redeeming a saved verifier, while preserving older iOS records that omit the flow kind.
