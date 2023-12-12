---
'@clerk/nextjs': major
---

(Note: This is only relevant if, in the unlikely case, you are using `Clerk` from `@clerk/nextjs` directly. If not, you can safely ignore this change.)

Remove the named `Clerk` import from `@clerk/nextjs` and import `createClerkClient` instead. The latter is a factory method to create a Clerk client instance for you. This update aligns usage across our SDKs and will enable us to ship DX improvements better in the future.

```js
import { Clerk } from '@clerk/nextjs';
const clerk = Clerk({ secretKey: '...' });
```

You need to rename the import from `Clerk` to `createClerkClient` and change its usage:

```js
import { createClerkClient } from '@clerk/nextjs';
const clerk = createClerkClient({ secretKey: '...' });
```

