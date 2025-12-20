---
'@clerk/expo': major
---

Remove deprecated `Clerk` export in favor of `getClerkInstance()`.

```diff
- import { Clerk } from '@clerk/clerk-expo';
+ import { getClerkInstance } from '@clerk/expo';

- const token = await Clerk.session?.getToken();
+ const token = await getClerkInstance().session?.getToken();
```

If you need to create the instance before `ClerkProvider` renders, pass the `publishableKey`:

```tsx
import { ClerkProvider, getClerkInstance } from '@clerk/expo';

const clerkInstance = getClerkInstance({ publishableKey: 'pk_xxx' });

// Use the instance outside of React
const token = await clerkInstance.session?.getToken();
fetch('https://example.com/api', { headers: { Authorization: `Bearer ${token}` } });
```

> [!NOTE]
> - Calling `getClerkInstance()` with different publishable keys will create a new Clerk instance.
> - If `getClerkInstance` is called without a publishable key, and `ClerkProvider` has not rendered yet, an error will be thrown.
