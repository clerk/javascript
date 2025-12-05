---
title: '`colorRing` and `colorModalBackdrop` now render at full opacity'
matcher:
  - 'colorRing'
  - 'colorModalBackdrop'
category: 'breaking'
warning: true
---

The `colorRing` and `colorModalBackdrop` CSS variables now render at full opacity when modified via the appearance prop or CSS variables. Previously, provided colors were rendered at 15% opacity.

If you were relying on the previous behavior, you may need to adjust your color values to include the desired opacity:

```diff
appearance={{
  variables: {
-   colorRing: '#6366f1',
+   colorRing: 'rgba(99, 102, 241, 0.15)',
  }
}}
```
