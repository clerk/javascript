---
'@clerk/nextjs': patch
---

- Export ClerkMiddlewareAuthObject, ClerkMiddlewareAuth and ClerkMiddlewareOptions types
- Introduce `auth().redirectToSignIn()` that can be used in API routes and pages, eg
```ts
import { auth } from '@clerk/nextjs/server';

export const Layout = ({ children }) => {
  const { userId } = auth();

  if (!userId) {
    return auth().redirectToSignIn();
  }

  return <>{children}</>;
};
```
