---
"@clerk/expo": major
---

The `publishableKey` prop is now required in `ClerkProvider`. Previously, the prop was optional and would fall back to `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` or `CLERK_PUBLISHABLE_KEY` environment variables.

Environment variables inside `node_modules` are not inlined during production builds in React Native/Expo, which could cause apps to crash in production when the publishable key is undefined.

You must now explicitly pass the `publishableKey` prop to `ClerkProvider`:

```tsx
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

<ClerkProvider publishableKey={publishableKey}>
  {/* Your app */}
</ClerkProvider>
