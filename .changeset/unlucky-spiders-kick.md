---
'@clerk/tanstack-start': minor
---

Introduce `EmailLinkErrorCodeStatus` to support users in custom flows and mark `EmailLinkErrorCode` as deprecated.

```diff
- import { EmailLinkErrorCode } from '@clerk/nextjs/errors'
+ import { EmailLinkErrorCodeStatus } from '@clerk/nextjs/errors'
```

PR https://github.com/clerk/javascript/pull/5142
