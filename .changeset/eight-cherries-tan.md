---
'@clerk/backend': major
---

Change `SessionApi.getToken()` to return consistent `{ data, errors }` return value 
and fix the `getToken()` from requestState to have the same return behavior as v4 
(return Promise<string> or throw error).
This change will fix issues in `@clerk/nextjs` / `@clerk/remix` with `getToken()`:

Example:
```typescript
import { getAuth } from '@clerk/remix';

const { getToken } = getAuth(...);
const jwtString = await getToken();
```
