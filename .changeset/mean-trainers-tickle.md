---
'@clerk/clerk-expo': minor
---

Introduce improved offline support for Expo.

We're introducing an improved offline support for the `@clerk/clerk-expo` package to enhance reliability and user experience. This new improvement allows apps to bootstrap without an internet connection by using cached Clerk resources, ensuring quick initialization.

It solves issues as the following:

- Faster resolution of the `isLoaded` property and the `ClerkLoaded` component, with only a single network fetch attempt, and if it fails, it falls back to the cached resources.
- The `getToken` function of `useAuth` hook now returns a cached token if network errors occur.
- Developers can now catch and handle network errors gracefully in their custom flows, as the errors are no longer muted.

How to use it:

1. Install the `expo-secure-store` package in your project by running:

    ```bash
    npm i expo-secure-store
    ```

2. Use `import { secureStore } from "@clerk/clerk-expo/secure-store"` to import our implementation of the `SecureStore` API.
3. Pass the `secureStore` in the `__experimental_resourceCache` property of the `ClerkProvider` to enable offline support.

```tsx
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo'
import { Slot } from 'expo-router'
import { tokenCache } from '../token-cache'
import { secureStore } from '@clerk/clerk-expo/secure-store'

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

  if (!publishableKey) {
    throw new Error('Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file')
  }

  return (
    <ClerkProvider 
        publishableKey={publishableKey}
        tokenCache={tokenCache}
        __experimental_resourceCache={secureStore}
    >
      <ClerkLoaded>
        <Slot />
      </ClerkLoaded>
    </ClerkProvider>
  )
}
```
