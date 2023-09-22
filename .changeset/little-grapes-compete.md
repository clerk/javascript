---
'@clerk/clerk-js': patch
'@clerk/backend': patch
---

Removing the `__clerk_referrer_primary` that was marked as deprecated. It was introduced to support the multi-domain featured, but was replaced shortly after.
