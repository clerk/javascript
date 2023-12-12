---
'@clerk/backend': major
'@clerk/gatsby-plugin-clerk': major
'@clerk/nextjs': major
'@clerk/remix': major
---

## Breaking Changes

### @clerk/backend

Replace `Clerk` with `createClerkClient` [SDK-1058]


```js
import { Clerk } from '@clerk/backend';
const clerk = Clerk({ secretKey: '...' });
```

now becomes:

```js
import { createClerkClient } from '@clerk/backend';
const clerk = createClerkClient({ secretKey: '...' });
```

### @clerk/gatsby-plugin-clerk

No longer returning `Clerk`. Please replace with `createClerkClient`

### @clerk/nextjs

No longer returning `Clerk`. Please replace with `createClerkClient`

### @clerk/remix

No longer returning `Clerk`. Please replace with `createClerkClient`
