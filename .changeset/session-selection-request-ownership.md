---
'@clerk/ui': patch
---

Prevent account selection from starting while another request is pending on the same card. Keep loading until selection finishes, and release loading when the account selection screen closes.
