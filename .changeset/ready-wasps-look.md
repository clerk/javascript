---
'@clerk/backend': minor
---

Adds the ability to perform CRUD operations on JWT Templates to the Backend API client.


```ts
  import { createClerkClient } from '@clerk/backend';

  const clerkClient = createClerkClient(...);

  await clerkClient.jwtTemplates.list({...});
  await clerkClient.jwtTemplates.get('templateId');
  await clerkClient.jwtTemplates.create({...});
  await clerkClient.jwtTemplates.update({...});
  await clerkClient.jwtTemplates.delete('templateId');
```