---
'@clerk/clerk-js': minor
'@clerk/localizations': minor
'@clerk/shared': minor
'@clerk/ui': minor
---

Add a role mapping step to the self-serve Directory Sync setup in `<OrganizationProfile />`. Organization admins can now assign an organization role to each directory group their identity provider pushes, set which group wins when a member belongs to several, and turn role syncing on or off. Members in no mapped group keep the organization's default role. The step is read-only for members without the `org:sys_memberships:manage` permission and while the organization's role set is being migrated.
