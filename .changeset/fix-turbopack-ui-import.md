---
'@clerk/nextjs': patch
---

Fix Turbopack compatibility for `ui` prop by adding `turbopackIgnore` magic comment alongside `webpackIgnore` on the dynamic `@clerk/ui/entry` import. This prevents both bundlers from statically resolving the optional dependency at build time.
