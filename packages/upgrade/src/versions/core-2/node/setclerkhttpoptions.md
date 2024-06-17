---
title: '`setClerkHttpOptions` removed, pass options to `createClerkClient` instead'
matcher: "setClerkHttpOptions\\("
category: 'setter-removal'
---

Setters that change options on the singleton `clerkClient` instance have been removed. Instead, pass the option directly to `createClerkClient` - see [the documentation](https://clerk.com/docs/references/nodejs/overview#customizing-resources) for more detail.

```diff
import { clerkClient, setClerkApiKey } from '@clerk/clerk-sdk-node';

- const clerkClient = createClerkClient({ apiKey: '...' });
- setClerkHttpOptions('...');

+ const clerkClient = createClerkClient({ secretKey: '...', httpOptions: '...' });
```
