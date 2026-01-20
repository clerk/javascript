---
'@clerk/shared': patch
'@clerk/ui': patch
---

Add development-mode warning when users customize Clerk components using structural CSS patterns (combinators, positional pseudo-selectors, etc.) without pinning their `@clerk/ui` version. This helps users avoid breakages when internal DOM structure changes between versions.
