---
'@clerk/clerk-react': minor
---

Apply the following changes to components with routing props:
- default is `routing="path"` and `path` prop is required to be set via env or context
- when `routing="hash"` or `routing="virtual"` is set the implicit (via env or context) `path` option is ignored
- when `routing="hash"` or `routing="virtual"` then `path` prop is not allowed to be set

Examples of components with routing props:
- `<CreateOrganization />`
- `<OrganizationProfile />`
- `<SignIn />`
- `<SignUp />`
- `<UserProfile />`
