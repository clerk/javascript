---
title: '`ClerkAPIError.kind` value updated'
matcher: 'ClerkApiError'
category: 'behavior-change'
warning: true
---

`ClerkAPIError.kind` has been updated to match the class name:

```diff
- static kind = 'ClerkApiError'
+ static kind = 'ClerkAPIError'
```

Most users should not be affected. If you were checking this string directly (for example, `error.constructor.kind === 'ClerkApiError'`), update the comparison value.

No other changes are required.
