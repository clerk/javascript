---
title: '`createTheme` moved to `@clerk/ui/themes/experimental`'
matcher:
  - '__experimental_createTheme'
  - 'experimental_createTheme'
category: 'breaking'
---

The `createTheme` theme utility has been moved to a new export path. Update your imports:

```diff
- import { __experimental_createTheme } from '@clerk/ui';
+ import { createTheme } from '@clerk/ui/themes/experimental';
```

Note: The `__experimental_` prefix has been removed from the method since they're now in the `/themes/experimental` subpath.

The `@clerk/themes` package has been replaced by `@clerk/ui`. The upgrade CLI will automatically remove `@clerk/themes` and install `@clerk/ui` in your dependencies.
