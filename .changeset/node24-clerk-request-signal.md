---
'@clerk/backend': patch
'@clerk/react-router': patch
'@clerk/tanstack-react-start': patch
---

Fix `Request` cloning and outbound `fetch` to omit cross-realm `AbortSignal`. Node 24's bundled undici tightened the `instanceof AbortSignal` check on `RequestInit.signal`, which broke:

- Cloning framework-specific requests such as `NextRequest` in `@clerk/backend`'s `ClerkRequest`.
- Subclassed `Request`s passed through `patchRequest` in `@clerk/react-router` and `@clerk/tanstack-react-start`.
- Frontend API proxying in `@clerk/backend`'s `clerkFrontendApiProxy`, which forwarded the inbound request's signal to the upstream `fetch`. Abort propagation will be restored in a follow-up via an in-realm `AbortController` bridge.
