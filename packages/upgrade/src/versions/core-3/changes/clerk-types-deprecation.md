---
title: '`@clerk/types` deprecated in favor of `@clerk/shared/types`'
matcher: "from\\s+['\"]@clerk/types['\"]"
category: 'deprecation'
warning: true
---

The `@clerk/types` package is deprecated. All type definitions have been consolidated into `@clerk/shared/types`.

Update your imports:

```diff
- import type { ClerkResource, UserResource } from '@clerk/types';
+ import type { ClerkResource, UserResource } from '@clerk/shared/types';
```

The `@clerk/types` package will continue to re-export types from `@clerk/shared/types` for backward compatibility, but new types will only be added to `@clerk/shared/types`.

**Note:** The `Appearance` type should be imported from `@clerk/ui` instead of `@clerk/shared/types`:

```diff
- import type { Appearance } from '@clerk/types';
+ import type { Appearance } from '@clerk/ui';
```
