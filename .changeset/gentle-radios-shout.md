---
'@clerk/clerk-sdk-node': patch
'@clerk/backend': major
'@clerk/nextjs': patch
---

The following paginated APIs now return `{ data, totalCount }` instead of simple arrays, in order to make building paginated UIs easier:
- `clerkClient.users.getOrganizationMembershipList(...)`
- `clerkClient.organization.getOrganizationList(...)`
- `clerkClient.organization.getOrganizationInvitationList(...)`

Revert changing the `{ data, errors }` return value of the following helpers to throw the `errors` or return the `data` (keep v4 format):

- `import { verifyToken } from '@clerk/backend'`
- `import { signJwt, hasValidSignature, decodeJwt, verifyJwt } from '@clerk/backend/jwt'`
- BAPI `clerkClient` methods eg (`clerkClient.users.getUserList(...)`)
