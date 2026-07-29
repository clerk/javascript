---
'@clerk/electron': patch
---

Add a `useHostedAuth()` hook to `@clerk/electron/react` for authenticating through Clerk's hosted Account Portal in the system browser. Calling `startHostedAuth({ mode })` opens the hosted sign-in or sign-up page externally, waits for the deep-link redirect registered with `createClerkBridge({ renderer })`, and activates the created session in the app. The flow is protected with a PKCE verifier and a `state` check.

```tsx
import { useHostedAuth } from '@clerk/electron/react';

function SignInButton() {
  const { startHostedAuth } = useHostedAuth();
  return <button onClick={() => startHostedAuth({ mode: 'sign-in' })}>Sign in</button>;
}
```
