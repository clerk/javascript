---
title: '`useSignInWithApple` and `useSignInWithGoogle` moved to separate entry points'
packages: ['expo']
matcher: "import\\s+\\{[^}]*\\b(useSignInWithApple|useSignInWithGoogle)\\b[^}]*\\}\\s+from\\s+['\"]@clerk/expo['\"]"
matcherFlags: 'm'
category: 'breaking'
---

The `useSignInWithApple` and `useSignInWithGoogle` hooks have been moved to dedicated entry points to avoid bundling optional dependencies.

Update your imports:

```diff
- import { useSignInWithApple } from '@clerk/expo';
+ import { useSignInWithApple } from '@clerk/expo/apple';

- import { useSignInWithGoogle } from '@clerk/expo';
+ import { useSignInWithGoogle } from '@clerk/expo/google';
```

This change prevents `expo-crypto` and `expo-apple-authentication` from being bundled when not using native sign-in hooks.
