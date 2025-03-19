---
"@clerk/clerk-expo": patch
---

The `publishableKey` prop type in the `<ClerkProvider>` component is now marked as optional to match its runtime behavior. Please use the `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` environment variable to set your publishable key.
