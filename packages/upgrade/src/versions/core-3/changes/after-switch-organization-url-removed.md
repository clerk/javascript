---
title: '`afterSwitchOrganizationUrl` removed from `OrganizationSwitcher`'
matcher: 'afterSwitchOrganizationUrl'
category: 'deprecation-removal'
---

The `afterSwitchOrganizationUrl` prop has been removed from `OrganizationSwitcher`. Use `afterSelectOrganizationUrl` instead:

```diff
<OrganizationSwitcher
- afterSwitchOrganizationUrl="/org-dashboard"
+ afterSelectOrganizationUrl="/org-dashboard"
/>
```
