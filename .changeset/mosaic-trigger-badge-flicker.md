---
'@clerk/mosaic': patch
---

Fix the `UserButton` and `OrganizationSwitcher` trigger badge flickering when the popup opens with an inline `renderTriggerBadge` function. The badge is now only requested again when the displayed user, organization or session changes, and each request uses the latest `renderTriggerBadge` you pass.
