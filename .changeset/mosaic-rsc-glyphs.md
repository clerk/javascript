---
'@clerk/mosaic': patch
---

Glyphs imported from `@clerk/mosaic/icons/glyphs/*` can now be passed to `Icon` from React Server Components, e.g. `<Icon glyph={External} />` in a Next.js App Router page. Before, the page failed to render with "Functions cannot be passed directly to Client Components".
