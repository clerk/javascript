---
"@clerk/clerk-js": patch
---

Use a cookie instead of localStorage for the active org ID to avoid issues when localStorage is disabled at the browser level.
