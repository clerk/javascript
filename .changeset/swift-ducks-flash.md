---
'@clerk/backend': minor
---

Adds the ability to change production domains [beta] to the Backend API client.

```ts
  import { createClerkClient } from '@clerk/backend';

  const clerkClient = createClerkClient(...);

  await clerkClient.betaFeatures.changeDomain({
    homeUrl: 'https://www.example.com',
    isSecondary: false,
  });
```