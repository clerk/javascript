---
"@clerk/backend": patch
"@clerk/clerk-js": patch
---

Fix `satelliteAutoSync` to default to `false` as documented. Previously, not passing the prop resulted in `undefined`, which was treated as `true` due to a strict equality check (`=== false`). This preserved Core 2 auto-sync behavior instead of the intended Core 3 default. The check is now `!== true`, so both `undefined` and `false` skip automatic satellite sync.
