---
'@clerk/mosaic': patch
---

Remove the `organization` option from `UserButton`'s `mode` prop. `mode` now accepts `combined` (the default) or `user`. For an organization-only switcher, use the new `OrganizationSwitcher` export.
