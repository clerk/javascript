---
title: '`@clerk/clerk-react` renamed to `@clerk/react`'
packages: ['react']
matcher: '@clerk/clerk-react'
category: 'breaking'
docsAnchor: 'clerk-react-rename'
---

The `@clerk/clerk-react` package has been renamed to `@clerk/react`.

Update your imports:

```diff
- import { ClerkProvider, useUser } from '@clerk/clerk-react';
+ import { ClerkProvider, useUser } from '@clerk/react';
```

And update your package.json:

```diff
- "@clerk/clerk-react": "^5.0.0",
+ "@clerk/react": "^7.0.0",
```
