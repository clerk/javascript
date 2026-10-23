---
'@clerk/shared': minor
'@clerk/clerk-js': minor
'@clerk/ui': minor
'@clerk/mosaic': patch
---

Add `selfServeDirectorySyncEnabled` to `OrganizationResource`. Self-serve Directory Sync is now enabled per organization by this setting instead of following `selfServeSSOEnabled`. In `<OrganizationProfile />`, the Security page now appears for organizations that have only Directory Sync enabled, and their admins can manage the connection's directory. Organizations that have self-serve SSO without Directory Sync no longer see the Directory Sync section.
