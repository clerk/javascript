---
'@clerk/backend': major
---

Enforce passing `request` param to `authenticateRequest` method of `@clerk/backend`
instead of passing each header or cookie related option that is used internally to
determine the request state.

Migration guide:
- use `request` param in `clerkClient.authenticateRequest()` instead of:
    - `origin`
    - `host`
    - `forwardedHost`
    - `forwardedProto`
    - `referrer`
    - `userAgent`
    - `cookieToken`
    - `clientUat`
    - `headerToken`
    - `searchParams`

Example
```typescript
//
// current
//
import { clerkClient } from '@clerk/backend'

const requestState = await clerkClient.authenticateRequest({
    secretKey: 'sk_....'
    publishableKey: 'pk_....'
    origin: req.headers.get('origin'),
    host: req.headers.get('host'),
    forwardedHost: req.headers.get('x-forwarded-host'),
    forwardedProto: req.headers.get('x-forwarded-proto'),
    referrer: req.headers.get('referer'),
    userAgent: req.headers.get('user-agent'),
    clientUat: req.cookies.get('__client_uat'),
    cookieToken: req.cookies.get('__session'),
    headerToken: req.headers.get('authorization'),
    searchParams: req.searchParams
});

//
// new
//
import { clerkClient,  } from '@clerk/backend'

// use req (if it's a fetch#Request instance) or use `createIsomorphicRequest` from `@clerk/backend`
// to re-construct fetch#Request instance
const requestState = await clerkClient.authenticateRequest({
    secretKey: 'sk_....'
    publishableKey: 'pk_....'
    request: req
});

```