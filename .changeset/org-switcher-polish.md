---
'@clerk/ui': patch
---

Polish the `<OrganizationSwitcher />`:

- Decode avatar images synchronously so a freshly mounted avatar (e.g. when the popover opens) paints on its first frame instead of briefly flashing the avatar background.
- Highlight the trigger while its popover is open.
- Align the "Create organization" action's height with the other rows for a consistent list.
