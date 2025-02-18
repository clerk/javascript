---
"@clerk/nuxt": minor
---

Introduce `getAuth()` helper to retrieve authentication state from the [event](https://h3.unjs.io/guide/event) object.

Example:

```ts
import { getAuth } from '@clerk/nuxt/server';

export default eventHandler((event) => {
  const { userId } = getAuth(event);

  if (!userId) {
    // User is not authenticated
  }
});
```

