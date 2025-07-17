---
"@clerk/backend": patch
---

Bump `snakecase-keys` to v9 which is the first ESM-only versions. This change should resolve any `TypeError: Cannot destructure property 'snakeCase' of 'require(...)' as it is undefined.` errors using Vitest.


