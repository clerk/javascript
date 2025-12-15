---
title: '`getAuth()` helper removed'
packages: ['nuxt']
matcher: 'getAuth\\('
category: 'deprecation-removal'
---

The deprecated `getAuth()` helper has been removed. Use `event.context.auth()` in your server routes instead:

```diff
- import { getAuth } from '@clerk/nuxt/server';

export default defineEventHandler((event) => {
- const { userId } = getAuth(event);
+ const { userId } = event.context.auth();

  return {
    userId,
  };
});
```
