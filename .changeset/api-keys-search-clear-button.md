---
'@clerk/localizations': patch
'@clerk/shared': patch
'@clerk/ui': patch
---

Add a clear button to search inputs for quickly resetting the current query. It appears in the `<APIKeys />` search and the `<OrganizationProfile />` members search.

The button is themeable via the new `apiKeysSearchClearButton` and `organizationProfileMembersSearchClearButton` appearance elements, and its label can be customized with the new `apiKeys.action__clearSearch` and `organizationProfile.membersPage.action__clearSearch` localization keys.
