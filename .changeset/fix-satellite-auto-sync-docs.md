---
"@clerk/shared": patch
---

Fixed incorrect JSDoc for `satelliteAutoSync` option. The documented default was `false`, but the actual runtime behavior defaults to `true` (preserving Core 2 auto-sync behavior) when the option is omitted.
