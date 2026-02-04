---
"@clerk/expo": major
---

Move `useSignInWithApple` and `useSignInWithGoogle` to dedicated entry points to avoid bundling optional dependencies.

**Breaking Change:** Import paths have changed:

```typescript
// Before
import { useSignInWithApple } from '@clerk/expo';
import { useSignInWithGoogle } from '@clerk/expo';

// After
import { useSignInWithApple } from '@clerk/expo/apple';
import { useSignInWithGoogle } from '@clerk/expo/google';
```

This change prevents `expo-crypto` and `expo-apple-authentication` from being bundled when not using native sign-in hooks.
