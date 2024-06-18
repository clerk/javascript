---
title: '`useOrganizations` -> `useOrganizationList`'
matcher: "useOrganizations\\("
---

Any place where `useOrganizations` is used should be switched to [`useOrganizationList`](https://clerk.com/docs/references/react/use-organization-list) or [`useOrganization`](https://clerk.com/docs/references/react/use-organization) instead. The return signature has also changed, so take note of this when making the upgrade.

```js
// before: useOrganizations return values
{
    isLoaded: boolean,
    createOrganization: clerk.createOrganization,
    getOrganizationMemberships: clerk.getOrganizationMemberships,
    getOrganization: clerk.getOrganization,
}

// after: useOrganizationList return values
{
    isLoaded: boolean,
    createOrganization: clerk.createOrganization,
    userMemberships: PaginatedResourcesWithDefault<...> | PaginatedResources<...>,
    userInvitations: PaginatedResourcesWithDefault<...> | PaginatedResources<...>,
    userSuggestions: PaginatedResourcesWithDefault<...> | PaginatedResources<...>,
    setActive: clerk.setActive,
}
```
