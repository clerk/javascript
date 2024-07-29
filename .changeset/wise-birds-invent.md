---
"@clerk/clerk-js": patch
"@clerk/types": patch
---

Add support for disabling portaling within both `<UserButton />` and `<OrganizationSwitcher />` components.

Fixes issue where defaultOpen prop was not being forwarded within `<UserButton />`
