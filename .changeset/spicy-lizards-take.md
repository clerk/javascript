---
'@clerk/nextjs': minor
---

- Introduce `auth().redirectToSignUp()` that can be used in API routes and pages. Originally effort by [@sambarnes](https://github.com/clerk/javascript/pull/5407)

```ts
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware(async (auth) => {
  const { userId, redirectToSignUp } = await auth();

  if (!userId) {
    return redirectToSignUp();
  }
});
```
