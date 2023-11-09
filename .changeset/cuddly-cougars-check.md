---
'@clerk/shared': major
'@clerk/clerk-react': major
---

Drop deprecations. Migration steps:
- use `EmailLinkError` instead of `MagicLinkError`
- use `isEmailLinkError` instead of `isMagicLinkError`
- use `EmailLinkErrorCode` instead of `MagicLinkErrorCode`
- use `useEmailLink` instead of `useMagicLink`
- use `buildRequestUrl` from `@clerk/backend` instead of `getRequestUrl` from `@clerk/shared`
- use `OrganizationProvider` instead of `OrganizationContext`
- use `userMemberships` instead of `organizationList` from `useOrganizationList`