---
'@clerk/shared': patch
'@clerk/astro': patch
'@clerk/vue': patch
---

Align the `HeadlessBrowserClerk.load()` parameter type with the runtime behavior by accepting the full `ClerkOptions`, including `isSatellite`. The clerk-js implementation has always accepted and used `isSatellite` from `load()` options — it's the only way to configure a satellite app when using `@clerk/clerk-js` directly — but the type previously excluded it, producing a contradictory generated API reference and type errors for direct consumers.
