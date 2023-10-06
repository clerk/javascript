---
'@clerk/backend': patch
'@clerk/nextjs': patch
'@clerk/shared': patch
---

Retry the implemented changes from [#1767](https://github.com/clerkinc/javascript/pull/1767) which were reverted in [#1806](https://github.com/clerkinc/javascript/pull/1806) due to RSC related errors (not all uses components had the `use client` directive). Restore the original PR and add additional `use client` directives to ensure it works correctly.
