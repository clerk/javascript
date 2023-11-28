---
'@clerk/clerk-js': major
'@clerk/nextjs': minor
'@clerk/clerk-react': minor
'@clerk/remix': minor
'@clerk/types': patch
---

- By default, all the components with routing will have the `routing` prop assigned as `'path'` by default when the `path` prop is filled.
- The `<UserButton />` component will set the default value of the `userProfileMode` prop to `'navigation'` if the `userProfileUrl` prop is provided.
- The `<OrganizationSwitcher />` component will have the `organizationProfileMode` and `createOrganizationMode` props assigned with `'navigation'` by default if the `organizationProfileUrl` and `createOrganizationUrl` props are filled accordingly.
