---
'@clerk/backend': minor
---

Adds the Blocklist Identifier endpoints to the Backend API client.

```ts
  import { createClerkClient } from '@clerk/backend';

  const clerkClient = createClerkClient(...);
  await clerkClient.blocklistIdentifiers.getBlocklistIdentifierList();
  await clerkClient.blocklistIdentifiers.createBlocklistIdentifier({ identifier });
  await clerkClient.blocklistIdentifiers.deleteBlocklistIdentifier('blocklistIdentifierId');
```

Updates the ability paginate Allowlist Identifier reponses and access `identifierType` and `instanceId` from the response.

```ts
  import { createClerkClient } from '@clerk/backend';

  const clerkClient = createClerkClient(...);
  const res = await clerkClient.blocklistIdentifiers.getAllowlistIdentifierList({ limit, offset });
```