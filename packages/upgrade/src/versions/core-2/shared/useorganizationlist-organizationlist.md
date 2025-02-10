---
title: '`organizationList` -> `userMemberships` as param to `useOrganizationList`'
matcher: "useOrganizationList\\(\\s*{[\\s\\S]*?organizationList:[\\s\\S]*?\\)"
matcherFlags: 'm'
---

The deprecated `organizationList` param to `useOrganizationList` has been removed. Instead, use the `userMemberships` param. Note that the values to be passed to the param and the return value have also changed.

```js
// before
const { organizationList } = useOrganizationList({
  organizationList: { limit: 10, offset: 1 },
});

// after
const { memberships } = useOrganizationList({
  userMemberships: { initialPage: 1, pageSize: 10 },
});
```
