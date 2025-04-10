---
'@clerk/backend': minor
---

Adds the ability to create an active session to the Backend API client.

```ts
  import { createClerkClient } from '@clerk/backend';

  const clerkClient = createClerkClient(...);
  await clerkClient.sessions.createSession({
    userId: 'user_xxxxxx',
  });
```