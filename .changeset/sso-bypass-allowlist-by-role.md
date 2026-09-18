---
'@clerk/localizations': minor
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/ui': minor
---

The "Add members" card on the SSO allow list page of `<OrganizationProfile />` now offers two ways to add people: by email address, or every member with a given role at once. Members whose email address is not served by one of the organization's enterprise connections are skipped, and the page reports how many were added and skipped.

For custom flows, `organization.ssoBypassAllowlist` gains `addUsers({ userIds })`, which calls the new bulk endpoint in batches of 100 and returns the added entries together with the users that could not be added and why.

New customization handles: the `organizationProfileSecuritySsoBypassEmailInput`, `organizationProfileSecuritySsoBypassRoleWarning` and `organizationProfileSecuritySsoBypassBulkResult` appearance elements.
