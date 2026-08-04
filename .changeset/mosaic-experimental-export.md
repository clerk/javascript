---
'@clerk/nextjs': minor
'@clerk/react': minor
'@clerk/ui': minor
---

Add an experimental subpath for Mosaic components that mount directly in your app's tree rather than being rendered by clerk-js. `UserButton` is the first one. It reads Clerk through hooks, so a `ClerkProvider` above it is all it needs:

```tsx
import { UserButton } from '@clerk/nextjs/experimental/mosaic';
```

Pair it with the stylesheet, which carries the design tokens and every component rule:

```css
@import '@clerk/nextjs/experimental/mosaic/styles.css' layer(clerk);
```

The surface and the components behind it will change without a major version while they are experimental.

In `@clerk/ui`, the Mosaic stylesheet moves from `@clerk/ui/styles.css` to `@clerk/ui/experimental/mosaic/styles.css` to sit alongside the components it styles. Update the import if you were using it.
