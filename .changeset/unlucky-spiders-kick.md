---
'@clerk/tanstack-start': minor
---

Introduce `EmailLinkErrorCodeStatus` to support users in custom flows and mark `EmailLinkErrorCode` as deprecated.

```diff
- import { EmailLinkErrorCode } from '@clerk/tanstack-start/errors'
+ import { EmailLinkErrorCodeStatus } from '@clerk/tanstack-start/errors'
```

PR https://github.com/clerk/javascript/pull/5142
