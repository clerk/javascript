---
'@clerk/mosaic': patch
---

Rename two `UserButton` and `OrganizationSwitcher` props. `renderTriggerLabel` is now `showTriggerLabel`, and `renderTriggerBadge` is now `triggerBadge`. Both keep the same values and defaults, so update any usage of the old names; TypeScript flags each one.
