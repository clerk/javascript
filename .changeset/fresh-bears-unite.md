---
'@clerk/backend': patch
---

Adds the ability to verify proxy checks to the Backend API client.

```ts
  import { createClerkClient } from '@clerk/backend';

  const clerkClient = createClerkClient(...);
  await clerkClient.proxy_checks.verify({
    domainId: 'dmn_xxxxxx',
    proxyUrl: 'https://[your-domain].com'
  });
```