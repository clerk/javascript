---
'@clerk/clerk-expo': patch
---

Use a polyfill for the `atob` function to prevent errors when using the Hermes JS engine, since the engine's `atob` implementation is stricter than it should be.
