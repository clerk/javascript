---
'@clerk/ui': patch
---

Fix `<OrganizationProfile />` Security page showing Directory Sync and SSO setup actions to organization admins when the organization isn't allowed to set up enterprise SSO and Directory Sync. Those organizations now see their enterprise connections read-only, alongside the SSO bypass section.
