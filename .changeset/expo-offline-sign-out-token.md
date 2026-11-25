---
'@clerk/expo': patch
---

Fix sign-out with native components when the sign-out request fails. The app no longer stays on a loading state, including when signing out of the current session among several. After signing out of every session, the next sign-in starts on a new client instead of failing with `session_exists` or signing the previous user back in.
