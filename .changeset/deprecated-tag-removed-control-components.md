---
'@clerk/nextjs': patch
---

Add `@deprecated` tags to the removed `<SignedIn>`, `<SignedOut>`, and `<Protect>` control-component stubs so editors and lint rules flag them at authoring time (with the `<Show>` migration guidance) instead of only failing when rendered.
