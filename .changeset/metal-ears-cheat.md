---
'gatsby-plugin-clerk': major
---

## Breaking Changes

Remove the named `Clerk` import from `gatsby-plugin-clerk` and import `createClerkClient` instead. The latter is a factory method to create a Clerk client instance for you. This update aligns usage across our SDKs and will enable us to ship DX improvements better in the future. [SDK-1058]

Inside your code, search for occurrences like these:
	
```js
import { Clerk } from 'gatsby-plugin-clerk';
const clerk = Clerk({ secretKey: '...' });
```

You need to rename the import from `Clerk` to `createClerkClient` and change its usage:

```js
import { createClerkClient } from 'gatsby-plugin-clerk';
const clerk = createClerkClient({ secretKey: '...' });
```
