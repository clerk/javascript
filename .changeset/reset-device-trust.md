---
'@clerk/backend': minor
---

Add a `resetDeviceTrust` option to `sessions.revokeSession()` and `users.updateUser()`. When it is `true`, Clerk forgets the affected devices, so the user's next sign-in on them counts as a new device. `updateUser()` accepts it only with a new `password` or `passwordDigest` and `signOutOfOtherSessions: true`.
