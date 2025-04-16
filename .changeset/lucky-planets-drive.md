---
'@clerk/backend': minor
---

Adds the ability to perform CRUD operations on OAuth Applications to the Backend API client.


```ts
  import { createClerkClient } from '@clerk/backend';

  const clerkClient = createClerkClient(...);

  await clerkClient.oauthApplications.list({...});
  await clerkClient.oauthApplications.get('templateId');
  await clerkClient.oauthApplications.create({...});
  await clerkClient.oauthApplications.update({...});
  await clerkClient.oauthApplications.delete('templateId');
  await clerkClient.oauthApplications.rotateSecret('templateId');
```