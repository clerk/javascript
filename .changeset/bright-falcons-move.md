---
"@clerk/clerk-js": patch
---

Fix bug where session.getToken() was reading a stale organization ID.
