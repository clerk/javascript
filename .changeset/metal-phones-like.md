---
'@clerk/clerk-js': minor
'@clerk/types': minor
---

Introduce `cssLayerName` option to allow users to opt Clerk styles into a native CSS layer.

Enable CSS layer name on `ClerkProvider`

```tsx
<ClerkProvider
  cssLayerName="clerk"
>
 ...
</ClerkProvider>
```

Define CSS layer order

```css
@layer theme, base, clerk, components, utilities;
@import "tailwindcss";
```
