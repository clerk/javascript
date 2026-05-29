---
'@clerk/nextjs': patch
---

Restore Next 15 prerender compatibility for pages that call `auth()` / `currentUser()`. The `./server` subpath now splits by the `react-server` export condition: app-router-only helpers live under the RSC condition, while the pages-router-safe surface (`getAuth`, `buildClerkProps`, `clerkMiddleware`, etc.) remains in the default condition. `server-only` is now imported statically in `auth.ts` / `currentUser.ts` — cleaner than the previous lazy-`require` and analyzable by webpack in both CJS and ESM module classifications.
