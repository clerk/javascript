---
"@clerk/backend": minor
---

Improve `subject` property handling for machine auth objects.

Usage:

```ts
import { createClerkClient } from '@clerk/backend'

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
})

const requestState = await clerkClient.authenticateRequest(request, {
  acceptsToken: 'any',
})

const authObject = requestState.toAuth()

switch (authObject.tokenType) {
  case 'api_key':
    // authObject.userId
    // authObject.orgId
    break;
  case 'machine_token':
    // authObject.machineId
    break;
  case 'oauth_token':
    // authObject.userId
    // authObject.clientId
    break;
}
```
