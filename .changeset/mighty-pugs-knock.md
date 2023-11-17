---
'@clerk/clerk-sdk-node': major
'@clerk/backend': major
'@clerk/nextjs': major
---

Change the response payload of Backend API requests to return `{ data, errors }` instead of return the data and throwing on error response.
Code example to keep the same behavior:
```typescript
import { users } from '@clerk/backend';
import { ClerkAPIResponseError } from '@clerk/shared/error';

const { data, errors, clerkTraceId, status, statusText } = await users.getUser('user_deadbeef');
if(errors){
    throw new ClerkAPIResponseError(statusText, { data: errors, status, clerkTraceId });
}
```