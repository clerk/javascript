---
'@clerk/clerk-js': patch
---

Wait up to 10 seconds, instead of 5, for the Device Intelligence check to finish before sending a sign-in or sign-up without its result. This applies when an instance hasn't configured its own limit. Users on slow connections are less likely to have sign-ups blocked by protections that require a Device Intelligence result.
