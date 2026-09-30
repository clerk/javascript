---
'@clerk/mosaic': patch
---

A combined `UserButton` now always leads with the account, with its avatar badged with the active organization, and the `modePriority` prop is removed. With an organization active, the header's **Settings** button opens a menu with **Organization settings** and **Profile settings**. The account row above the organization list is gone. The footer's **Sign out** now signs out of the active account, and **Sign out of all accounts** moves into the **Switch account** menu. `signOutAll` is no longer a `menuItemOrder` id. In `user` mode, the header carries the settings gear alone.
