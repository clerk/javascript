---
'@clerk/backend': minor
---

Adds the ability to grab an instance's JWKS to the Backend API client.

```ts
  import { createClerkClient } from '@clerk/backend';

  const clerkClient = createClerkClient(...);
  await clerkClient.jwks.getJWKS();
```