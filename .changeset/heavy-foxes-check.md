---
'@clerk/backend': minor
---

Adds the following functionality for Instances to the Backend API client.


```ts
  import { createClerkClient } from '@clerk/backend';

  const clerkClient = createClerkClient(...);

  await clerkClient.instance.get();
  await clerkClient.instance.update({...});
  await clerkClient.instance.updateRestrictions({...});
  await clerkClient.instance.updateOrganizationSettings({...});
```