---
title: '`Organization.getOrganizationList` return type changed'
matcher: "\\.getOrganizationList\\("
category: 'pagination-return'
---

The return type for this function was previously `[Items]` but has now been updated to `{ data: [Items], totalCount: number }`. Since Clerk's API responses are paginated, the `totalCount` property is helpful in determining the total number of items in the response easily. A before/after code example can be seen below:

```diff
  const { organization } = useOrganization()
  const orgList = organization.getOrganizationList()

- orgList.forEach(() => {})
+ orgList.data.forEach(() => {})
```
