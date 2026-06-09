---
'@clerk/backend': patch
---

Fix the return type of `clerkClient.organizations.createOrganizationInvitationBulk()` to `PaginatedResourceResponse<OrganizationInvitation[]>`. The Backend API returns the bulk-created invitations in a `{ data, totalCount }` envelope (the same shape as `getOrganizationInvitationList()`), but the method was typed as `OrganizationInvitation[]`, which did not match the value returned at runtime.
