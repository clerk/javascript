---
'@clerk/nextjs': patch
---

Fix `getAuth()` and `auth()` returning OAuth and M2M tokens as signed-in user sessions. Machine tokens are now rejected where a session is expected, so both helpers return a signed-out state for them. `getAuth()` also no longer throws when the request carries an opaque machine token such as an API key.
