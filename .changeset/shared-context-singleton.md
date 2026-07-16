---
'@clerk/shared': patch
---

Make React contexts created by `createContextAndHook` resilient to duplicate module instances. When a bundler ends up with more than one copy of `@clerk/shared/react` (for example Vite/Rolldown pre-bundling it separately from the `ClerkProvider`), each copy previously created its own context object, so a provider from one copy and a `useClerk`/`use*Context` hook from another would not match and threw "... not found". Contexts are now cached on a global registry keyed by package version and display name, so every duplicated instance shares one context object.
