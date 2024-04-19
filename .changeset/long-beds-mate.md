---
'@clerk/nextjs': major
'@clerk/clerk-react': major
'@clerk/remix': major
'@clerk/types': major
---

Drop deprecations. Migration steps:
- drop `orgs` jwt claim from session token
- change type of `auth` param of `withServerAuth()` callback to `AuthObject` from `ServerSideAuth` in `gatsby-clerk-plugin`
    - use `auth.sessionClaims` instead of `auth.claims`
    - use `AuthObject` properties from `auth`
- use `publishableKey` instead of `frontendApi`
- use `ClerkProviderOptionsWrapper` type instead of `IsomorphicClerkOptions`
