---
title: '`appearance.layout` renamed to `appearance.options`'
matcher: 'appearance[\\s\\S]*?\\.layout'
matcherFlags: 'm'
category: 'breaking'
---

The `appearance.layout` property has been renamed to `appearance.options`. Update all instances in your codebase:

```diff
<ClerkProvider
  appearance={{
-   layout: {
+   options: {
      socialButtonsPlacement: 'bottom',
      socialButtonsVariant: 'iconButton',
    }
  }}
>
```
