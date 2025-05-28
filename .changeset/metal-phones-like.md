---
'@clerk/clerk-js': patch
'@clerk/types': patch
---

Introduce experimental `cssLayerName` option to allow users to opt into CSS layers.

Enable CSS layer name on `ClerkProvider`

```tsx
<ClerkProvider
  experimental={{
    cssLayerName: "clerk",
  }}
>
 ...
</ClerkProvider>
```

Define CSS layer order

```css
@layer theme, base, clerk, components, utilities;
@import "tailwindcss";
```
