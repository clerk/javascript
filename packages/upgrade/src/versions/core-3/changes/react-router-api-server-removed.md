---
title: '`@clerk/react-router/api.server` export deprecated'
packages: ['react-router']
matcher: '@clerk/react-router/api.server'
category: 'deprecation'
warning: true
---

The `@clerk/react-router/api.server` export is deprecated and will be removed in a future major version. Use `@clerk/react-router/server` instead.

```diff
- import { createClerkClient } from '@clerk/react-router/api.server';
+ import { createClerkClient } from '@clerk/react-router/server';
```

A codemod is available to automatically apply this change:

```bash
npx @clerk/upgrade --release core-3
```
