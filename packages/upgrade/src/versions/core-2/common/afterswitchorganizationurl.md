---
title: '`afterSwitchOrganizationUrl` -> `afterSelectOrganizationUrl` in `OrganizationSwitcher`'
matcher: "<OrganizationSwitcher[\\s\\S]*?(afterSwitchOrganizationUrl)=[\\s\\S]*?>"
category: 'deprecation-removal'
matcherFlags: 'm'
replaceWithString: 'afterSelectOrganizationUrl'
---

The `afterSwitchOrganizationUrl` prop on the `<OrganizationSwitcher />` component has been renamed to `afterSelectOrganizationUrl`. This is a quick and simple rename.

```diff
- <OrganizationSwitcher afterSwitchOrganizationUrl='...' />
+ <OrganizationSwitcher afterSelectOrganizationUrl='...' />
```
