---
'@clerk/clerk-sdk-node': major
---

Internal top-level BAPI resources was dropped to resolve some issues with our type resolution and also make our exposed API cleaner.
```typescript
// Before
import { users } from "@clerk/clerk-sdk-node"
// After
import { clerkClient } from "@clerk/clerk-sdk-node"
clerkClient.users
```