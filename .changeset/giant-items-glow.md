---
'@clerk/nextjs': patch
---

- Introduce `auth().redirectToSignUp()` that can be used in API routes and pages, eg
```ts
import { auth } from '@clerk/nextjs/server';

export const Layout = ({ children }) => {
  const { userId } = auth();

  if (!userId) {
    return auth().redirectToSignUp();
  }

  return <>{children}</>;
};
```
