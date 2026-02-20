---
title: '`simple` theme export removed from `@clerk/ui`'
matcher:
  - 'import.*simple.*from.*@clerk/ui'
  - '__experimental_simple'
  - 'experimental__simple'
category: 'breaking'
---

The `simple` theme is no longer exported directly from `@clerk/ui`. Use the `appearance` prop to apply it instead:

```diff
- import { __experimental_simple } from '@clerk/ui';
-
- <ClerkProvider appearance={{ baseTheme: __experimental_simple }}>
+ <ClerkProvider appearance={{ theme: 'simple' }}>
    {/* Your app */}
  </ClerkProvider>
```
