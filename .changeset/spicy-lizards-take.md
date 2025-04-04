---
'@clerk/nextjs': minor
---

- Introduce `auth().redirectToSignUp()` that can be used in API routes and pages.

```ts
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware(async (auth) => {
  const { userId, redirectToSignUp } = await auth();

  if (!userId) {
    return redirectToSignUp();
  }
});
```
