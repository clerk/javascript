---
'@clerk/backend': minor
---

Introduce a new getOrganizationInvitationList() method, along with support for filtering by status and the regular limit & offset parameters, which it can be used in order to list the invitations of a specific organization. We also marked the old getPendingOrganizationInvitationList() method as deprecated
