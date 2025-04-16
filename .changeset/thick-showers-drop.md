---
'@clerk/backend': patch
---

Adds the ability to list and create waitlist entries to the Backend API client.


```ts
  import { createClerkClient } from '@clerk/backend';

  const clerkClient = createClerkClient(...);

  await clerkClient.waitlistEntries.list({...});
  await clerkClient.waitlistEntries.create({
    emailAddress: 'you@yourdomain.com', 
    notify: true
  });
```