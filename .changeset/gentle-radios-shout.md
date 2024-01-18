---
'@clerk/clerk-sdk-node': patch
'@clerk/backend': major
'@clerk/nextjs': patch
---

Revert changing the `{ data, errors }` return value of the following helpers to throw the `errors` or return the `data` (keep v4 format):

- `import { verifyToken } from '@clerk/backend'`
- `import { signJwt, hasValidSignature, decodeJwt, verifyJwt } from '@clerk/backend/jwt'`
- BAPI `clerkClient` methods eg (`clerkClient.users.getUserList(...)`)