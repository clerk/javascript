---
'@clerk/clerk-expo': minor
---

Introduce `getClerkInstance()` to avoid importing the Clerk class from clerk-js manually.

This enables developers to create and access a Clerk instance in their application outside of React.
```tsx
import { ClerkProvider, getClerkInstance } from "@clerk/expo"

const clerkInstance = getClerkInstance({ publishableKey: 'xxxx' })
  
// Always pass the `publishableKey` to `ClerkProvider`
<ClerkProvider publishableKey={'xxxx'}>
    ...
</ClerkProvider>

// Somewhere in your code, outside of React you can do
const token = await clerkInstance.session?.getToken();
fetch('http://example.com/', {headers: {Authorization: token })
```
```tsx
import { ClerkProvider, getClerkInstance } from "@clerk/expo"

// Always pass the `publishableKey` to `ClerkProvider`
<ClerkProvider publishableKey={'xxxx'}>
    ...
</ClerkProvider>

// If you sure that this code will run after the ClerkProvider has rendered then you can use `getClerkIntance` without options
const token = await getClerkInstance().session?.getToken();
fetch('http://example.com/', {headers: {Authorization: token })

```
Attention: If `getClerkInstance` is called without a publishable key, and ClerkProvider has not rendered yet, an error will be thrown 

