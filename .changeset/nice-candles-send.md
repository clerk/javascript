---
'@clerk/backend': minor
---

Adds webhooks endpoints to the Backend API client.

```ts
  import { createClerkClient } from '@clerk/backend';

  const clerkClient = createClerkClient(...);
  await clerkClient.webhooks.createSvixApp();
  await clerkClient.webhooks.generateSvixAuthURL();
  await clerkClient.webhooks.deleteSvixApp();
```