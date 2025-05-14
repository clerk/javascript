---
'@clerk/clerk-js': patch
---

Bug fix: Call `setActive` after closing Checkout to ensure RSCs re-render with the new auth context.
