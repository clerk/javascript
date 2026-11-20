---
'@clerk/mosaic': minor
---

The Security page of `<OrganizationProfile />` and `<Profile />` now lists the organization's SSO connections to members with the `org:sys_entconns:manage` permission when self-serve SSO is enabled. Each connection shows its domains and status, and can be activated, deactivated or removed. Managing a connection opens a dialog to rename it, copy its service provider details, edit its SAML or OIDC identity provider settings and signing certificates, and turn its sign-in settings on or off.
