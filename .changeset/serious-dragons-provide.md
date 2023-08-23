---
'@clerk/clerk-js': patch
'@clerk/clerk-expo': patch
---

Ensure the session token is updated when calling `setActive()` in a non-browser environment.
