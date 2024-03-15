---
"@clerk/backend": patch
---

Introduce `clerkClient.samlConnections` to expose `getSamlConnectionList`, `createSamlConnection`, `getSamlConnection`, `updateSamlConnection` and `deleteSamlConnection` endpoints. Introduce `SamlConnection` resource for BAPI.

Example:
```
import { clerkClient } from '@clerk/nextjs/server';
const samlConnection = await clerkClient.samlConnections.getSamlConnectionList();
```
