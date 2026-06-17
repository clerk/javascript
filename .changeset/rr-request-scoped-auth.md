---
'@clerk/react-router': patch
---

`getAuth()` now resolves the current request's authentication from request-scoped storage instead of relying solely on the React Router context. Apps that share a single `RouterContextProvider` across requests (for example a custom server or `getLoadContext` that returns one instance) no longer risk one request being served another user's auth under concurrency. Auth is bound to the per-request async execution scope and also survives React Router's action-to-loader revalidation. When a context that is reused across requests is detected, `clerkMiddleware()` now logs a one-time warning, since a shared context can still leak an application's own per-request data.
