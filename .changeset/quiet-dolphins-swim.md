---
'@clerk/clerk-js': minor
---

Handle `offline_access` scope in OAuth consent screen by filtering it from the displayed scopes list (as it describes access duration rather than what can be accessed) and appending informational text about staying signed in when the scope is present.
