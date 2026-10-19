---
'@clerk/mosaic': patch
---

`UserButton` and `OrganizationSwitcher` now open Mosaic's own `UserProfile` and `OrganizationProfile` in a dialog when managing the account or organization, instead of Clerk's profile modals. The profiles close on their own when the user signs out or no organization is active.

`userProfileProps` and `organizationProfileProps` no longer accept `appearance`, and their `customPages` no longer accept links (entries with an `href`); pass custom pages with `content` only.
