---
'@clerk/clerk-sdk-node': patch
'@clerk/backend': patch
---

Inherit verifyToken options from clerkClient.
The below code now works as expected: (requires CLERK_SECRET_KEY env var to have been set)
```ts
import { clerkClient } from "@clerk/clerk-sdk-node";

clerkClient.verifyToken(token, {})
```
