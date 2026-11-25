---
'@clerk/clerk-js': patch
---

Clear cached session tokens and cancel proactive refresh timers when a session is removed or leaves signed-in status on client updates, preventing background token refresh requests for already-removed sessions.
