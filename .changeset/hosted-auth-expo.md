---
'@clerk/expo': minor
---

Introduce the `useHostedAuth()` hook for signing users in or up through Clerk's hosted Account Portal from native Expo apps.

```tsx
import { useHostedAuth } from '@clerk/expo/hosted-auth'

const { startHostedAuth } = useHostedAuth()

// Opens Account Portal on the sign-in page
await startHostedAuth()

// Or open the sign-up page first
await startHostedAuth({ mode: 'sign-up' })
```
