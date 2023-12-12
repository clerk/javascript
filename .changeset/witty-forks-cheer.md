---
'@clerk/clerk-react': major
'@clerk/types': major
---

Align return types for redirectTo* methods in ClerkJS [SDK-1037]

Breaking Changes:

- `redirectToUserProfile` now returns `Promise<unknown>` instead of `void`
- `redirectToOrganizationProfile` now returns `Promise<unknown>` instead of `void`
- `redirectToCreateOrganization` now returns `Promise<unknown>` instead of `void`
- `redirectToHome` now returns `Promise<unknown>` instead of `void`
