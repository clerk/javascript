---
title: '`getToken()` throws `ClerkOfflineError` when offline'
matcher: 'getToken\(|session\.getToken'
matcherFlags: 'm'
category: 'breaking'
---

`getToken()` now throws a `ClerkOfflineError` instead of returning `null` when the browser is offline. This change makes it explicit that the request failed due to network conditions, not because the user is signed out.

### Before (Core 2)

```typescript
const token = await session.getToken();
if (token === null) {
  // Ambiguous: could mean signed out OR offline
}
```

### After (Core 3)

```typescript
import { ClerkOfflineError } from '@clerk/react/errors';
// Or from other packages: '@clerk/nextjs/errors', '@clerk/vue/errors', etc.

try {
  const token = await session.getToken();
  // token is guaranteed to be a valid string if user is signed in
} catch (error) {
  if (ClerkOfflineError.is(error)) {
    // Handle offline scenario explicitly
    showOfflineScreen();
  } else {
    // Handle other errors
    throw error;
  }
}
```

### Using the Type Guard

Use `ClerkOfflineError.is()` to check if an error is an offline error:

```typescript
import { ClerkOfflineError } from '@clerk/react/errors';

try {
  const token = await clerk.session?.getToken();
} catch (error) {
  if (ClerkOfflineError.is(error)) {
    // TypeScript knows error is ClerkOfflineError here
    console.log('User is offline');
  }
}
```

### Common Patterns

**Pattern 1: Show offline UI**

```typescript
catch (error) {
  if (ClerkOfflineError.is(error)) {
    showToast('You appear to be offline. Some features may be limited.');
    return;
  }
}
```

**Pattern 2: Queue for retry**

```typescript
catch (error) {
  if (ClerkOfflineError.is(error)) {
    retryQueue.add(() => fetchData());
    return;
  }
}
```

### Migration Notes

- If you were checking for `null` from `getToken()` to detect offline state, wrap the call in a try-catch and check for `ClerkOfflineError`
- The error is thrown after a short retry period (~15 seconds) to handle temporary network issues
- `getToken()` still returns `null` when the user is not signed in
