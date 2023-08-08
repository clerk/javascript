---
'@clerk/clerk-js': patch
'@clerk/types': patch
---

Construct urls based on context in <OrganizationSwitcher/>
- Deprecate `afterSwitchOrganizationUrl`
- Introduce `afterSelectOrganizationUrl` & `afterSelectPersonalUrl`

`afterSelectOrganizationUrl` accepts
- Full URL -> 'https://clerk.com/'
- relative path -> '/organizations'
- relative path -> with param '/organizations/:id'
- function that returns a string -> (org) => `/org/${org.slug}`
`afterSelectPersonalUrl` accepts
- Full URL -> 'https://clerk.com/'
- relative path -> '/users'
- relative path -> with param '/users/:username'
- function that returns a string -> (user) => `/users/${user.id}`
