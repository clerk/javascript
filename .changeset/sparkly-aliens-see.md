---
'@clerk/tanstack-react-start': major
'@clerk/react-router': major
'@clerk/clerk-js': major
'@clerk/upgrade': major
'@clerk/nextjs': major
'@clerk/shared': major
'@clerk/react': major
'@clerk/nuxt': major
'@clerk/vue': major
---

`getToken()` now throws `ClerkOfflineError` instead of returning `null` when the client is offline.

This makes it explicit that a token fetch failure was due to network conditions, not authentication state. Previously, returning `null` could be misinterpreted as "user is signed out," potentially causing the cached token to be cleared.

To handle this change, catch `ClerkOfflineError` from `getToken()` calls:

```typescript
import { ClerkOfflineError } from '@clerk/react/errors';

try {
  const token = await session.getToken();
} catch (error) {
  if (ClerkOfflineError.is(error)) {
    // Handle offline scenario - show offline UI, retry later, etc.
  }
  throw error;
}
```
