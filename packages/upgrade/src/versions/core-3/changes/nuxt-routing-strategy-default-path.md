---
title: 'Routing strategy now defaults to `path`'
packages: ['nuxt']
matcher:
  - '<SignIn'
  - '<SignUp'
  - '<UserProfile'
  - '<OrganizationProfile'
  - '<CreateOrganization'
  - '<OrganizationList'
category: 'behavior-change'
warning: true
---

The following components now default to `path` routing strategy instead of `hash`:

- `<SignIn />`
- `<SignUp />`
- `<UserProfile />`
- `<OrganizationProfile />`
- `<CreateOrganization />`
- `<OrganizationList />`

If you were relying on the previous `hash` routing behavior, explicitly set the routing prop:

```vue
<SignIn routing="hash" />
```
