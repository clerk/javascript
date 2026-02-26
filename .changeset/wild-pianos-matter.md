---
'@clerk/chrome-extension': minor
---

Added new `createClerkClient()` export from @clerk/chrome-extension/client

```ts
import { createClerkClient } from '@clerk/chrome-extension/client';

const publishableKey = process.env.CLERK_PUBLISHABLE_KEY;
// Use createClerkClient in a popup or side panel
const clerk = createClerkClient({ publishableKey });'

// Use createClerkCleint in a background service worker
const clerk = await createClerkClient({ publishableKey: 'pk_...', background: true });
```

`createClerkClient()` from @clerk/chrome-extension/background is deprecated.
