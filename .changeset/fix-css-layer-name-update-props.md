---
'@clerk/ui': patch
---

Fix `cssLayerName` from theme not being applied after initial mount. When `ClerkProvider` re-renders, the `updateProps` handler overwrote the extracted `cssLayerName` with the raw appearance object, causing Clerk's runtime CSS to not be wrapped in `@layer`. This broke Tailwind utility overrides when using themes like `shadcn` that set `cssLayerName: 'components'`.
