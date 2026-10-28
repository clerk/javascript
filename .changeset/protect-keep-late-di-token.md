---
'@clerk/clerk-js': patch
---

Keep a Device Intelligence result that arrives after ClerkJS has stopped waiting for it, and use it for the next sign-in or sign-up instead of discarding it. Users on slow connections who retry are less likely to have sign-ups blocked by protections that require a Device Intelligence result.
