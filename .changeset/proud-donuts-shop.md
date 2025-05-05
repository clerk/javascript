---
'@clerk/clerk-js': patch
'@clerk/types': patch
---

Remove `Clerk.commerce` and any usages. Hoist `Clerk.commerce.billing` to `Clerk.billing`. Payment source related methods have been moved to `Clerk.user` and `Clerk.organization`.
