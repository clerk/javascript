---
title: '`Organizations.getPendingOrganizationInvitationList` -> `getOrganizationInvitationList`'
matcher: "\\.(getPendingOrganizationInvitationList)\\("
replaceWithString: 'getOrganizationInvitationList'
---

The `Organizations.getPendingOrganizationInvitationList` method has been removed. To match the same functionality, use `Organizations.getOrganizationInvitationList` and pass in `status` option as "pending" instead.

```diff
- clerkClient.organizations.getPendingOrganizationInvitationList()
+ clerkClient.organizations.getOrganizationInvitationList({ status: "pending" })
```
