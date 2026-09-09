---
'@clerk/clerk-js': patch
---

Keep completed native sign-in and sign-up attempts available for explicit finalization after a client refresh. Discarded attempts can no longer replace the current authentication state with late updates, and retained attempts are cleared when the client changes or all sessions are removed.
