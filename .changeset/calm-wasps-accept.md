---
'@clerk/clerk-expo': minor
---

Introduce `getClerkIntance()` to avoid importing the Clerk class from clerk-js manually.

This enables developers to create and access a Clerk instance in their application outside of React.
```tsx

import { ClerkProvider, getClerkIntance } from "@clerk/expo"

const clerkInstance = getClerkIntance({ publishableKey: 'xxxx' })
  
// Be sure to pass the new instance to ClerkProvider to avoid running multiple instances of Clerk in your application
<ClerkProvider publishableKey={'xxxx'}>
    ...
</ClerkProvider>

// Somewhere in your code, outside of React you can do
const token = await clerkInstance.session?.getToken();
fetch('http://example.com/', {headers: {Authorization: token })
```
