---
title: '`membershipList` -> `members` as param to `useOrganization`'
matcher: "useOrganizations\\(\\s*{[\\s\\S]*?membershipList:"
matcherFlags: 'm'
---

The `membershipList` param from the `useOrganization` hook has been removed. Instead, [use the `memberships` param](https://clerk.com/docs/references/react/use-organization#parameters). Examples of each can be seen here:

```js
// before
const { membershipList } = useOrganization({
  membershipList: { limit: 10, offset: 1 },
});

// after
const { memberships } = useOrganization({
  memberships: {
    initialPage: 1,
    pageSize: 10,
  },
});

// you can also simply return all memberships
const { memberships } = useOrganization({ memberships: true });
```
