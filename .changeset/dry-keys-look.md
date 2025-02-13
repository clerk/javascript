---
'@clerk/react-router': minor
'@clerk/clerk-js': minor
'@clerk/nextjs': minor
'@clerk/shared': minor
'@clerk/clerk-react': minor
'@clerk/remix': minor
---

Introduce `EmailLinkErrorCodeStatus` to support users in custom flows and mark `EmailLinkErrorCode` as deprecated.

```diff
- import { EmailLinkErrorCode } from '@clerk/nextjs/errors'
+ import { EmailLinkErrorCodeStatus } from '@clerk/nextjs/errors'
```
