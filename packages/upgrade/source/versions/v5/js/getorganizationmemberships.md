---
title: '`Clerk.getOrganizationMemberships()` -> `user.getOrganizationMemberships()`'
matcher: "Clerk.getOrganizationMemberships\\("
---

The `getOrganizationMemberships` [method on the `Clerk` class](https://clerk.com/docs/references/javascript/clerk/clerk#organization) has been removed. Instead, use `getOrganizationMemberships` on a user instance.

```diff
- Clerk.getOrganizationMemberships();
+ user.getOrganizationMemberships();
```
