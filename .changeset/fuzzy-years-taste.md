---
'@clerk/backend': major
---

## Breaking Changes

Remove the named `Clerk` import from `@clerk/backend` and import `createClerkClient` instead. The latter is a factory method that will create a Clerk client instance for you. This aligns usage across our SDKs and will enable us to better ship DX improvements in the future. [SDK-1058]


Inside your code, search for occurrences like these:
	
```js
import { Clerk } from '@clerk/backend';
const clerk = Clerk({ secretKey: '...' });
```

You need to rename the import from `Clerk` to `createClerkClient` and change its usage:

```js
import { createClerkClient } from '@clerk/backend';
const clerk = createClerkClient({ secretKey: '...' });
```
