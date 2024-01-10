---
'@clerk/backend': major
---

Change `SessionApi.getToken()` to return consistent `{ data, errors }` return value 
and fix the `getToken()` from requestState to have the same return behavior as v4 
(return Promise<string> or throw error).
This change fixes issues with `getToken()` in `@clerk/nextjs` / `@clerk/remix` / `@clerk/fastify` / `@clerk/sdk-node` / `gatsby-plugin-clerk`:

Example:
```typescript
import { getAuth } from '@clerk/nextjs/server';

const { getToken } = await getAuth(...);
const jwtString = await getToken(...);
```

The change in `SessionApi.getToken()` return value is a breaking change, to keep the existing behavior use the following:
```typescript
import { ClerkAPIResponseError } from '@clerk/shared/error';

const response = await clerkClient.sessions.getToken(...);

if (response.errors) {
    const { status, statusText, clerkTraceId } = response;
    const error = new ClerkAPIResponseError(statusText || '', {
        data: [],
        status: Number(status || ''),
        clerkTraceId,
    });
    error.errors = response.errors;

    throw error;
}

// the value of the v4 `clerkClient.sessions.getToken(...)`
const jwtString = response.data.jwt;
```
