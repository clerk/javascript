---
title: '`setClerkApiKey` removed, pass `secretKey` to `createClerkClient` instead'
matcher: "setClerkApiKey\\("
---

Setters that change options on the singleton `clerkClient` instance have been removed. Instead, pass the option directly to `createClerkClient` - see [the documentation](https://clerk.com/docs/references/nodejs/overview#customizing-resources) for more detail. Note that the name `apiKey` should now be `secretKey` as well.

```js
import { clerkClient, setClerkApiKey } from '@clerk/clerk-sdk-node';

// Before
const clerkClient = createClerkClient({ apiKey: '...' });
setClerkApiKey('...');

// After
const clerkClient = createClerkClient({ secretKey: '...' });
```
