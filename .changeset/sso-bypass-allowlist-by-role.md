---
'@clerk/localizations': minor
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/ui': minor
---

The "Add members" card on the SSO allow list page of `<OrganizationProfile />` now offers two ways to add people: by email address, or every member with a given role at once. Members whose email address is not served by one of the organization's enterprise connections are skipped. When nothing could be added the card stays open and says why, and when some were added it moves to a success step that reports how many were skipped.

For custom flows, `organization.ssoBypassAllowlist` gains `addUsers({ userIds })`, which calls the new bulk endpoint in batches of 100 and returns the added entries together with the users that could not be added and why.

Inputs marked to be ignored by password managers now also carry the Bitwarden, LastPass and Dashlane opt-out attributes, so those extensions stop offering to fill fields such as the allow list email address.

The member picker that the "Add member" card shipped with in 4.18.0 is gone, and so are its localization keys under `organizationProfile.securityPage.ssoBypassPage.addForm`: `memberLabel`, `memberPlaceholder`, `changeButton` and `noResults`. The feature was never enabled on any instance, so no application depends on them.

New customization handles: the `organizationProfileSecuritySsoBypassEmailInput`, `organizationProfileSecuritySsoBypassRoleWarning`, `organizationProfileSecuritySsoBypassFailure` and `organizationProfileSecuritySsoBypassBulkResult` appearance elements.
