---
'@clerk/clerk-js': patch
---

Fix users being signed out right after a successful sign-up when the client returned with the verification does not list the new session yet. `setActive({ session })` now reloads the client once when it receives a session ID the client does not know, instead of treating it as a sign-out.
