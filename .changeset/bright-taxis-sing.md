---
'@clerk/expo': minor
---

Add an experimental `useSSO()` hook at `@clerk/expo/experimental` that uses future auth resources and activates completed SSO sessions automatically.

```tsx
import { useSSO } from '@clerk/expo/experimental';

const { startSSOFlow } = useSSO();

await startSSOFlow({
  strategy: 'oauth_google',
});
```
