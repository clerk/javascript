---
title: '`Organizations.getOrganizationInvitationList` return type changed'
matcher: "\\.getOrganizationInvitationList\\("
category: 'pagination-return'
warning: true
---

The return type for this function was previously `[Items]` but has now been updated to `{ data: [Items], totalCount: number }`. Since Clerk's API responses are paginated, the `totalCount` property is helpful in determining the total number of items in the response easily. A before/after code example can be seen below:

```diff
  const data = await clerkClient.organizations.getOrganizationInvitationList({
    organizationId: "...",
  })

- data.forEach(() => {})
+ data.data.forEach(() => {})
```
