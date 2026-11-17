---
'@clerk/clerk-js': patch
---

Fix React Native apps that use `__experimental_resourceCache` overwriting the cached environment with an empty one when startup falls back to the cached resources. Listeners notified of the cached client now see the cached environment instead of an unloaded one, so `@clerk/expo` no longer persists an environment without instance settings, which the next offline launch would load as if it were valid.
