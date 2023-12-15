---
'@clerk/clerk-sdk-node': major
---

Drop all pre-instantiated Backend API resources (`allowlistIdentifiers`, `clients`, `emailAddresses`, `emails`, `invitations`, `organizations`, `phoneNumbers`, `redirectUrls`, `sessions`, `signInTokens`, `users`, `domains`). Use the `clerkClient` import instead.
```typescript
// Before
import { users } from "@clerk/clerk-sdk-node"
// After
import { clerkClient } from "@clerk/clerk-sdk-node"
clerkClient.users
```