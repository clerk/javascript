---
'@clerk/backend': minor
---

Expose `totalCount` from `@clerk/backend` client responses for responses
containing pagination information or for responses with type `{ data: object[] }`.


Example:
```typescript
import { Clerk } from '@clerk/backend'

const clerkClient = Clerk({ secretKey: '...'});

// current
const { data } = await clerkClient.organizations.getOrganizationList();
console.log('totalCount: ', data.length);

// new
const { data, totalCount } = await clerkClient.organizations.getOrganizationList();
console.log('totalCount: ', totalCount);

```