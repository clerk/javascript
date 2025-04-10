---
'@clerk/backend': patch
---

Adds the ability to verify proxy checks to the Backend API client.

```ts
  import { createClerkClient } from '@clerk/backend';

  const clerkClient = createClerkClient(...);
  await clerkClient.sessions.createSession({
    userId: 'user_xxxxxx',
  });
```