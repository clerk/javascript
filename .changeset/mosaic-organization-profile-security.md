---
'@clerk/mosaic': minor
---

`<OrganizationProfile />` and `<Profile />` now show a Security page with the organization's SSO bypass allow list. Members with the `org:sys_entconns_sso_bypass:manage` permission can see who is on the list, search it, remove members, and add members by email or by role. The page shows once the organization has an enterprise connection, or for members with `org:sys_entconns:manage` when self-serve SSO is enabled for the instance and the organization.
