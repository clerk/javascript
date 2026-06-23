---
'@clerk/clerk-js': patch
'@clerk/ui': patch
---

The Security tab in `<OrganizationProfile />` is now hidden for members who lack the manage enterprise connections permission (`org:sys_entconns:manage`), instead of rendering a permission-denied state. This matches how the Members, Billing, and API keys tabs are gated.
