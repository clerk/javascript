---
'@clerk/clerk-sdk-node': patch
'@clerk/backend': patch
---

Inherit verifyToken options from clerkClient.
The below code now works as expected: (requires CLERK_SECRET_KEY env var to have been set)
```ts
import { clerkClient } from "@clerk/clerk-sdk-node";

// Use the default settings from the already instanciated clerkClient
clerkClient.verifyToken(token)
// or provide overrides the options 
clerkClient.verifyToken(token, {
  secretKey: 'xxxx'
})
```
