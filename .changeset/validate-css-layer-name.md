---
'@clerk/ui': patch
---

Validate `appearance.cssLayerName` before wrapping component styles in `@layer`. Values that are not a valid CSS layer name (for example ones containing braces, semicolons, or markup) are now ignored with a one-time console warning instead of being interpolated into the generated stylesheet.
