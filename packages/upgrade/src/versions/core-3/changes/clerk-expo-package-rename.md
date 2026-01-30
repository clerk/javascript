---
title: '`@clerk/clerk-expo` renamed to `@clerk/expo`'
packages: ['expo']
matcher: '@clerk/clerk-expo'
category: 'breaking'
docsAnchor: 'clerk-expo-rename'
---

The `@clerk/clerk-expo` package has been renamed to `@clerk/expo`.

Update your imports:

```diff
- import { ClerkProvider, useUser } from '@clerk/clerk-expo';
+ import { ClerkProvider, useUser } from '@clerk/expo';
```

And update your `package.json`:

```diff
- "@clerk/clerk-expo": "^2.0.0",
+ "@clerk/expo": "^3.0.0",
```
