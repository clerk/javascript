---
'@clerk/elements': patch
'@clerk/nextjs': patch
'@clerk/shared': patch
'@clerk/types': patch
'@clerk/clerk-js': patch
---

Fixes issues in `ClerkRouter` that were causing inaccurate pathnames within Elements flows. Also fixes a dependency issue where `@clerk/elements` was pulling in the wrong version of `@clerk/shared`.
