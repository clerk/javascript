---
'@clerk/backend': minor
---

Adds the ability to retrieve and update Sign Up Attemps to the Backend API client.


```ts
  import { createClerkClient } from '@clerk/backend';

  const clerkClient = createClerkClient(...);

  await clerkClient.signUps.get('signUpAttemptId');
  await clerkClient.signUps.update({...});
```