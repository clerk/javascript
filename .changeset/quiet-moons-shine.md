---
'@clerk/clerk-js': patch
'@clerk/shared': patch
'@clerk/ui': patch
---

Enable self-serve OIDC configuration for every application. Organization admins can now select an OIDC provider in the `<OrganizationProfile />` Security tab without the `experimental.oidcSelfServe` option, and existing OIDC connections open their configuration steps instead of the unsupported-provider state. The `experimental.oidcSelfServe` option no longer does anything and can be removed from `<ClerkProvider />` and `Clerk.load()`.
