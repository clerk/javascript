---
'@clerk/localizations': minor
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/ui': minor
---

Organization admins can now manage the SSO bypass allowlist from the Security page of `<OrganizationProfile />`. Members on the list can sign in with an email code when the organization's identity provider is unavailable. The page shows how many members are allowlisted, and the Manage action opens a page to search the list, add a member, or remove one. Both the section and the page require the new `org:sys_entconns_sso_bypass:manage` permission, and they also appear for organizations whose enterprise connections were set up by the instance owner rather than through self-serve SSO. In that case the SSO section lists the connections without any configuration actions.

For custom flows, `OrganizationResource` gains `getSsoBypassAllowlistUsers()`, `addSsoBypassAllowlistUser({ userId })` and `removeSsoBypassAllowlistUser(userId)`, returning the new `SsoBypassAllowlistUserResource`.

New customization handles ship with it: the `ssoBypass` `ProfileSectionId`, and the `organizationProfileSecuritySsoBypass*` appearance elements for the section, the allow list page, its search inputs, the Add button and the member picker options.
