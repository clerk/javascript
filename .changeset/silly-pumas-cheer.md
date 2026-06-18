---
'@clerk/react': patch
---

Fix `ReferenceError: global is not defined` thrown from the browser Clerk loader during `<ClerkProvider>` startup in production builds (seen in TanStack Start and React Router apps). The loader now reads the Clerk global via `globalThis` instead of relying on a `window.global` polyfill side-effect, whose load order across bundler chunks was not guaranteed.
