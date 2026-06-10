---
'@clerk/localizations': patch
'@clerk/clerk-js': patch
'@clerk/shared': patch
'@clerk/ui': patch
---

Rename the `<OrganizationProfile />` SSO page to "Security". The navbar entry is now labeled "Security" with a shield icon, its route path changed from `organization-self-serve-sso` to `organization-security`, and a new `organizationProfile.navbar.security` localization key replaces `organizationProfile.navbar.selfServeSSO`.
