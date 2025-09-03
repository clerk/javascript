---
'@clerk/clerk-js': patch
---

Do not trigger organization roles query when the current user's membership lacks the required permissions (`org:sys_memberships:read` or `org:sys_memberships:manage`).

This fixes an issue where the `OrganizationSwitcher` component was making unnecessary API calls to fetch roles, resulting in HTTP 403 errors.
