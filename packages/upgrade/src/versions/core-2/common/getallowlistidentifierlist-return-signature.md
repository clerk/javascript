---
title: '`AllowlistIdentifiers.getAllowlistIdentifierList` return signature changed'
matcher: "\\.allowlistIdentifiers\\.getAllowlistIdentifierList\\("
category: 'pagination-return'
warning: true
---

The response payload of `AllowlistIdentifiers.getAllowlistIdentifierList` was changed as part of the core 2 release. Rather than directly returning ` data`, the return signature is now `{ data, totalCount }`. Since backend API responses are paginated, the `totalCount` property is helpful in determining the total number of items in the response easily, and this change in the backend SDK aligns the response shape with what the backend API returns directly.

Here's an example of how the response shape would change with this modification:

```diff
- const data = await clerkClient.allowlistIdentifiers.getAllowlistIdentifierList()
+ const { data, totalCount } = await clerkClient.allowlistIdentifiers.getAllowlistIdentifierList()
```
