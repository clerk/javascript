---
'@clerk/nextjs': patch
---

Remove `usePathname()` from internal navigation hook for `cacheComponents` compatibility.

`usePathname()` was called in `useInternalNavFun` (used by the internal `useAwaitablePush`/`useAwaitableReplace` hooks in `ClientClerkProvider`). With Next.js 16's `cacheComponents: true`, `usePathname()` is treated as uncached/dynamic data during prerendering. Since `ClerkProvider` is rendered in the layout (outside `<Suspense>`), this caused build failures on routes with dynamic segments (e.g. `[id]`).

The fix removes `usePathname()` and relies on `useTransition`'s `isPending` state to detect navigation completion, which is sufficient for flushing pending navigation promises.
