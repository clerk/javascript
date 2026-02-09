---
'@clerk/nextjs': patch
---

Fix Turbopack compatibility for `ui` prop by removing `webpackIgnore` magic comment from dynamic `@clerk/ui/entry` import. Turbopack does not support `webpackIgnore`, causing the bare module specifier to reach the browser and fail at runtime.
