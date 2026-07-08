---
'@clerk/ui': patch
---

Decode avatar images synchronously so a freshly mounted avatar (e.g. when the `<OrganizationSwitcher />` popover opens) paints on its first frame instead of briefly flashing the avatar background.
