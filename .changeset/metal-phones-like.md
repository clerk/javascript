---
'@clerk/clerk-js': minor
'@clerk/types': minor
---

Introduce experimental `cssLayerName` option to allow users to opt into CSS layers.

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
