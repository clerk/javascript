---
title: '`setClerkApiKey` removed, pass `secretKey` to `createClerkClient` instead'
matcher: "setClerkApiKey\\("
category: 'setter-removal'
---

Setters that change options on the singleton `clerkClient` instance have been removed. Instead, pass the option directly to `createClerkClient` - see [the documentation](https://clerk.com/docs/references/nodejs/overview#customizing-resources) for more detail. Note that the name `apiKey` should now be `secretKey` as well.

```diff
import { createClerkClient, setClerkApiKey } from '@clerk/clerk-sdk-node';

- const clerkClient = createClerkClient({ apiKey: '...' });
- setClerkApiKey('...');

+ const clerkClient = createClerkClient({ secretKey: '...' });
```
