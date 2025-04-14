---
'@clerk/backend': minor
---

Adds domain endpoints to the Backend API client.

```ts
  import { createClerkClient } from '@clerk/backend';

  const clerkClient = createClerkClient(...);
  await clerkClient.domains.list();
  await clerkClient.domains.add({...});
  await clerkClient.domains.update({...});
  await clerkClient.domains.delete('satelliteDomainId');
```