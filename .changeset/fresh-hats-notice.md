---
'@clerk/clerk-expo': minor
---

Expose secure token cache implementation using expo-secure-store.

Usage:

```tsx
// app/_layout.tsx
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'

export default function RootLayout() {
  return (
    <ClerkProvider 
      publishableKey="your-publishable-key" 
      tokenCache={tokenCache}
    >
      {/* Your app code */}
    </ClerkProvider>
  )
}
```