---
title: '`afterSwitchOrganizationUrl` -> `afterSelectOrganizationUrl` in `OrganizationSwitcher`'
matcher: '<OrganizationSwitcher.*?(afterSwitchOrganizationUrl)=.*?>'
replaceWithString: 'afterSelectOrganizationUrl'
---

The `afterSwitchOrganizationUrl` prop on the `<OrganizationSwitcher />` component has been renamed to `afterSelectOrganizationUrl`. This is a quick and simple rename.

```js
// before
<OrganizationSwitcher afterSwitchOrganizationUrl='...' />

// after
<OrganizationSwitcher afterSelectOrganizationUrl='...' />
```
