---
title: '`MembershipRole` type replaced by `OrganizationCustomRoleKey` type'
matcher: "(?:\\.orgRole|\\.org_role)"
---

The `MembershipRole` type was replaced with `OrganizationCustomRoleKey` (related to [roles and permissions](https://clerk.com/docs/organizations/roles-permissions)). An example of where this type might be found:

```js
import { useAuth } from '@clerk/clerk-react';

const { orgRole } = useAuth();
```

To support the existing roles `admin`, `basic_member`, and `guest_member` apply interface merging using the following snippet:

```js
interface ClerkAuthorization {
  permission: ''
  role: 'admin' | 'basic_member' | 'guest_member'
}
```
