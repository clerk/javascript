---
'@clerk/localizations': minor
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/ui': minor
---

The SSO allow list page of `<OrganizationProfile />` can now add every member with a given role at once. The "Add member" card gains a role select and an "Add all" action; members whose email address is not served by one of the organization's enterprise connections are skipped, and the page reports how many were added and skipped.

For custom flows, `organization.ssoBypassAllowlist` gains `addUsers({ userIds })`, which calls the new bulk endpoint in batches of 100 and returns the added entries together with the users that could not be added and why.

New customization handles: the `organizationProfileSecuritySsoBypassAddAllButton` and `organizationProfileSecuritySsoBypassBulkResult` appearance elements.
