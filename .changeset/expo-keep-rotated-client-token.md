---
'@clerk/expo': patch
---

Fix an intermittent `No session was found with id sess_...` error right after signing in when native components are installed. A request that the JS or native SDK sent with the client token from before the sign-in could leave both SDKs on a new, empty client. The SDK now keeps the client that the sign-in created.
