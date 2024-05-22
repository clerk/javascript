---
'@clerk/clerk-expo': minor
---

Introduce `createClerkClient` to avoid importing the Clerk class from clerk-js manually.

This enables developers to create and access a Clerk instance in their application outside of React.
```tsx

import { ClerkProvider, createClerkClient } from "@clerk/expo"

const clerkInstance = createClerkClient({ publishableKey: 'xxxx' })
  
// Be sure to pass the new instance to ClerkProvider to avoid running multiple instances of Clerk in your application
<ClerkProvider Clerk={clerkInstance}>
    ...
</ClerkProvider>

// Somewhere in your code, outside of React you can do
const token = await Clerk.session?.getToken();
fetch('http://example.com/', {headers: {Authorization: token })
```
