---
'@clerk/shared': patch
'@clerk/backend': patch
---

Mark the keyless substrate as deprecated ahead of removal in the next major: `resolveKeysWithKeylessFallback` in `@clerk/shared/keyless`, and the experimental accountless applications API in `@clerk/backend`. Both are kept functional for the claimed-keys migration path and for older published SDK versions.
