---
'@clerk/backend': patch
---

Adds the ability to create and revoke actor tokens to the Backend API client.


```ts
  import { createClerkClient } from '@clerk/backend';

  const clerkClient = createClerkClient(...);

  const { id } = await clerkClient.actor_tokens.create({...});
  await clerkClient.actor_tokens.revoke(id);
```