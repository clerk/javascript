---
'@clerk/clerk-js': patch
---

Fix users being signed out right after a successful sign-up when the client returned with the verification does not list the new session yet. `setActive({ session })` now reloads the client once when it receives a session ID the client does not know. If the reloaded client still does not list the session, `setActive` treats it as a sign-out, as before.
