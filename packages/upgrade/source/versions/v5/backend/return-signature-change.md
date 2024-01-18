---
title: 'Return signature changed for all clerk backend requests'
matcher: "import\\s+{[\\s\\S]*?}\\s+from\\s+['\"]@clerk\/backend['\"]"
warning: true
---

The response payload of every backend API request was changed as part of the v5 release. Rather than directly returning ` data``, the return signature is now  `{ data, totalCount }`. Since backend API responses are paginated, the `totalCount` property is helpful in determining the total number of items in the response easily, and this change in the backend SDK aligns the response shape with what the backend API returns directly.

Here's an example of how the response shape would change with this modification:

```diff
- const data = await clerkClient.organizations.getOrganizationList()
+ const { data, totalCount } = await clerkClient.organizations.getOrganizationList()
```
