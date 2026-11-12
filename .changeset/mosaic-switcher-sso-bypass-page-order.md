---
'@clerk/mosaic': patch
---

Fix the organization profile's page order when `OrganizationSwitcher` or `UserButton` opens the legacy profile for a member who can manage the SSO bypass allowlist. The Security page now stays where `pageOrder` puts it instead of moving to the top.
