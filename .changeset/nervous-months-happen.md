---
"@clerk/nextjs": patch
---

Nonce was resolving to an empty string, added an else statement to make sure the nonce value was being updated properly.
