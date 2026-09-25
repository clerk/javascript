---
'@clerk/mosaic': patch
---

Derive the `UserButton` header layout from its actions: labelled buttons stack under the workspace, and a lone gear sits inline.

Remove the `modePriority` prop from `UserButton`. The header now follows what it leads with: an active organization offers Settings and Invite, and an account offers Settings and Sign out. `UserButtonView`'s `onSignOutSession` now also receives where the sign-out was pressed.
