---
title: '`invitationList` -> `invitations` as param to `useOrganizations`'
matcher: "useOrganizations\\(\\s*{[\\s\\S]*?invitationList:"
matcherFlags: 'm'
---

The `invitationList` param to the `useOrganizations` hook has been replaced by `invitations`. This param also has a slightly different way of working, examples included below. Note also that `useOrganizations` is deprecated and should be updated to `useOrganization` instead.

```js
// before
const { invitationList } = useOrganization({
  invitationList: { limit: 10, offset: 1 },
});

// after
const { invitations } = useOrganization({
  invitations: {
    initialPage: 1,
    pageSize: 10,
  },
});

// you can also simply return all invitations
const { invitations } = useOrganization({ invitations: true });
```
