---
"@clerk/tanstack-start": minor
---

Introduce `getAuth` that can be used in server functions.

Example usage:

```tsx
import { getAuth } from '@clerk/tanstack-start/server'
import { createServerFn } from '@tanstack/start'


export const fetchCurrentUserPosts = createServerFn('GET', async (_payload, ctx) => {
  const { userId } = await getAuth(ctx)

  if (!userId) {
    ...
  }

  ...
})
```
