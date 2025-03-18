---
'@clerk/clerk-expo': minor
---

Mark `secureStore` as deprecated in favor of `resourceCache` from `@clerk/clerk-expo/resource-cache`.

Usage:

```tsx
// app/_layout.tsx
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
// import { secureStore } from '@clerk/clerk-expo/secure-store'
import { resourceCache } from '@clerk/clerk-expo/resource-cache'

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey="your-publishable-key"
      tokenCache={tokenCache}
      // __experimental_resourceCache={secureStore}
      __experimental_resourceCache={resourceCache}
    >
      {...}
    </ClerkProvider>
  )
}
```
