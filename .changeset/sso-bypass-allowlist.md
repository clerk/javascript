---
'@clerk/localizations': minor
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/ui': minor
---

Add the ability for Organization admins to manage the SSO bypass allowlist from the Security page of `<OrganizationProfile />`.

For custom flows, `organization.ssoBypassAllowlist` exposes `getUsers()`, `addUser({ userId })` and `removeUser(userId)`.
