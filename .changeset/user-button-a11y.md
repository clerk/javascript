---
'@clerk/ui': minor
'@clerk/shared': patch
'@clerk/localizations': patch
---

Improve UserButton and OrganizationSwitcher accessibility. The trigger button now announces itself as a dialog trigger (`aria-haspopup="dialog"`) and the popover uses `role="dialog"` instead of `role="menu"` — consumers with tests selecting by `role="menu"` or `role="menuitem"` inside these components will need to update those selectors. Popovers now receive focus when opened, and actions are logically grouped with labelled `role="group"` elements for screen readers.

`@clerk/shared`: adds three optional localization keys — `userButton.label__userButtonPopover`, `userButton.label__accountActions`, and `userButton.label__activeSessions` — which can be customized via the `localization` prop.
