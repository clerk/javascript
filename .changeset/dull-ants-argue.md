---
'@clerk/backend': major
---

Change return value of `verifyToken()` from `@clerk/backend` to `{ data, error}`.
To replicate the current behaviour use this:
```typescript
import { verifyToken } from '@clerk/backend'

const { data, error }  = await verifyToken(...);
if(error){
    throw error;
}
```