---
'@clerk/mosaic': patch
---

Derive the `UserButton` header layout from its actions: labelled buttons stack under the workspace, and a lone gear sits inline.

Remove the `modePriority` prop from `UserButton`. The header now follows what it leads with: an active organization offers Settings and Invite, and an account offers Settings and Sign out. `UserButtonView`'s `onSignOutSession` now also receives where the sign-out was pressed.

The rows in the `UserButton` popup are now themed through their own `.cl-user-button-item` slots (`-media`, `-content`, `-label`, `-description`, `-trailing`), plus `.cl-user-button-group` and `.cl-user-button-separator`, instead of the shared `.cl-item` slots.

`Menu.Trigger` accepts `focusableWhenDisabled`, which keeps a disabled default trigger in the tab order. The `UserButton` menu triggers now use it, so they keep focus while an action is in flight. A row running an action now reports it to assistive tech, busy with a named progress indicator.
