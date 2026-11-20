---
'@clerk/backend': minor
---

Add a `resetClientTrust` option to `sessions.revokeSession()`. When it is `true`, Clerk also forgets the device the session was signed in on, so the user's next sign-in there counts as a new device.
