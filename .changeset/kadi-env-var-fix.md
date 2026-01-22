---
"@clerk/expo": major
---

fix(expo): Make publishableKey prop required and remove env var fallbacks

Made `publishableKey` a required prop in `ClerkProvider` since environment variables inside node_modules are not inlined during production builds. This was causing apps to work in development but crash in production TestFlight/Google Play builds because the env var would be unset.

**Migration:** Pass the publishable key explicitly to ClerkProvider:

```tsx
// Before (no longer works in production)
<ClerkProvider>

// After
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
<ClerkProvider publishableKey={publishableKey}>
```
