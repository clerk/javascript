---
title: '`setClerkHttpOptions` removed, pass options to `createClerkClient` instead'
matcher: "setClerkHttpOptions\\("
---

Setters that change options on the singleton `clerkClient` instance have been removed. Instead, pass the option directly to `createClerkClient` - see [the documentation](https://clerk.com/docs/references/nodejs/overview#customizing-resources) for more detail.

```js
import { clerkClient, setClerkApiKey } from '@clerk/clerk-sdk-node';

// Before
const clerkClient = createClerkClient({ apiKey: '...' });
setClerkHttpOptions('...');

// After
const clerkClient = createClerkClient({ secretKey: '...', httpOptions: '...' });
```
