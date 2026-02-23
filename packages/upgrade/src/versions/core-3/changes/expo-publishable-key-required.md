---
title: '`publishableKey` prop required in Expo `ClerkProvider`'
packages: ['expo']
matcher: '<ClerkProvider'
category: 'breaking'
warning: true
---

The `publishableKey` prop is now required in `ClerkProvider` for Expo apps. Previously, it would fall back to the `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` or `CLERK_PUBLISHABLE_KEY` environment variables, but environment variables inside `node_modules` are not inlined during production builds in React Native/Expo, which could cause apps to crash in production.

```diff
+ const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

- <ClerkProvider>
+ <ClerkProvider publishableKey={publishableKey}>
    {/* Your app */}
  </ClerkProvider>
```
