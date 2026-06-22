---
'@clerk/eslint-plugin': patch
---

The `require-auth-protection` rule now accepts OR-conditions like `if (!isAuthenticated || otherCondition)` when determining if a resource is protected.

Previously, only bare auth checks such as `if (!isAuthenticated)` were recognized. Guards with only `||` are safe but were incorrectly reported as missing protection.
