---
'@clerk/ui': minor
'@clerk/shared': patch
'@clerk/localizations': patch
---

Improve UserButton and OrganizationSwitcher accessibility. The trigger button now announces itself as a dialog trigger (`aria-haspopup="dialog"`) and the popover uses `role="dialog"` instead of `role="menu"`. UserButton and OrganizationSwitcher popovers now receive focus when opened, and actions are logically grouped with labelled `role="group"` elements for screen readers.