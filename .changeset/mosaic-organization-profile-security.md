---
'@clerk/mosaic': minor
---

`<OrganizationProfile />` and `<Profile />` now show a Security page with the organization's SSO bypass allow list. Members with the `org:sys_entconns_sso_bypass:manage` permission can see who is on the list, page through it, remove members after a confirmation, and add members by email or by role. The page shows to members with `org:sys_entconns_sso_bypass:manage` once the organization has an enterprise connection, and to members with `org:sys_entconns:manage` when self-serve SSO or self-serve Directory Sync is enabled for the instance and the organization.
