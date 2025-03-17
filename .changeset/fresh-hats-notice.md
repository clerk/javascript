---
'@clerk/clerk-expo': minor
---

Adds a secure token cache implementation using `expo-secure-store` which encrypts the session token before storing it.

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