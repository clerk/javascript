---
'@clerk/clerk-js': patch
'@clerk/shared': patch
---

Stop retrying native requests after sign-out, owner invalidation, or client credential rotation so a delayed retry cannot transmit an obsolete credential.
