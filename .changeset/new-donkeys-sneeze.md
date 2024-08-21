---
"@clerk/clerk-js": minor
---

Fixes a bug where multiple tabs with different active organizations would not always respect the selected organization. Going forward, when a tab is focused the active organization will immediately be updated to the tab's last active organization.

Additionally, `Clerk.session.getToken()` now accepts an `organizationId` option. The provided organization ID will be used to set organization-related claims in the generated session token.
