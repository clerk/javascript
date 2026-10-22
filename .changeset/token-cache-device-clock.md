---
'@clerk/clerk-js': patch
---

SessionTokenCache measures token age on the device clock, so a slow client clock no longer keeps serving a session token after it expired on the server.
