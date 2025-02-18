---
"@clerk/shared": patch
"@clerk/vue": patch
---

Previously, the `getCurrentOrganizationMembership()` function was duplicated in both `@clerk/vue` and `@clerk/shared/react`. This change moves the function to `@clerk/shared/organization`.
