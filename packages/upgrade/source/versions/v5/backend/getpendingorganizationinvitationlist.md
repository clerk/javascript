---
title: '`getPendingOrganizationInvitationList` -> `getOrganizationInvitationList`'
matcher: 'getPendingOrganizationInvitationList'
replaceWithString: 'getOrganizationInvitationList'
---

Use `getOrganizationInvitationList` with a `status` option instead.

```diff
- getPendingOrganizationInvitationList({ organizationId: "" })
+ getOrganizationInvitationList({ organizationId: "", status: "pending" })
```
