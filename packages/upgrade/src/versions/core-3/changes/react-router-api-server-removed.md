---
title: '`@clerk/react-router/api.server` export removed'
packages: ['react-router']
matcher: '@clerk/react-router/api.server'
category: 'breaking'
---

The `@clerk/react-router/api.server` export has been removed. Use `@clerk/react-router/server` instead.

```diff
- import { getAuth } from '@clerk/react-router/api.server';
+ import { getAuth } from '@clerk/react-router/server';
```

A codemod is available to automatically apply this change:

```bash
npx @clerk/upgrade --release core-3
```
