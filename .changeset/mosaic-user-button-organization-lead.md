---
'@clerk/mosaic': patch
---

When an organization is active, `UserButton` now leads with the organization. The trigger shows the organization's avatar and name, the popover header shows its avatar badged with the user's, with the user's identifier beneath the name, and the trigger's accessible name still names the user.

`UserButton` and `OrganizationSwitcher` now carry **Settings** and **Invite members** as rows beneath the organization list instead of as buttons in the header. With both an organization and the account to manage, **Settings** opens a menu of **Manage profile** and **Manage organization**. "Create organization" now reads "Add organization", and organizations are listed in the order the Frontend API returns them, rather than with the active one first. The rows of both, and the items of every Mosaic `Menu`, now use the regular font weight.

`customMenuItems` now sit in the group with **Settings** and **Invite members**, after them, instead of at the foot of the popover. `menuItemOrder` orders that group, by the ids `settings`, `inviteMembers` and each custom item's `id`. A custom item given `settings` or `inviteMembers` as its `id` replaces that row, in its place. The foot's rows are no longer reorderable, so the `switchAccount`, `addAccount` and `signOut` ids are ignored.

The `manage.organizationSettings`, `manage.profileSettings` and `manage.account` localization keys are replaced by `manage.profile`, and the header no longer renders `.cl-*-header-actions` or a `data-layout` attribute.
