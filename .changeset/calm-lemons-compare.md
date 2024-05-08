---
'@clerk/eslint-config-custom': patch
'@clerk/clerk-react': patch
---

Rename local `eslint-config-custom` package to `@clerk/eslint-config-custom` to avoid conflicts with previously published package. Removes `eslint-config-custom` from `@clerk/clerk-react`'s dependencies, as it should only be a development dependency.
