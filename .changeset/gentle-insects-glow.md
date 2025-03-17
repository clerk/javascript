---
'@clerk/clerk-expo': major
---

Mark `secureStore` as deprecated in favor of `resourceCache` from `@clerk/clerk-expo/resource-cache`.

Usage:

```tsx
// app/_layout.tsx
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { resourceCache } from '@clerk/clerk-expo/resource-cache'

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      tokenCache={tokenCache}
      __experimental_resourceCache={resourceCache}
    >
      {...}
    </ClerkProvider>
  )
}
```
