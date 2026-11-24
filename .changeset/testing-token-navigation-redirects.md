---
'@clerk/testing': patch
---

Fix `setupClerkTestingToken()` repeating Frontend API navigations, such as invitation links, when they redirect to an HTML page. The browser now follows the redirect itself, so a single-use ticket is accepted once.
