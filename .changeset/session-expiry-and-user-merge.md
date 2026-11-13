---
'@clerk/backend': minor
---

Add `sessions.updateSession()` to change when a single session expires, and `users.mergeUser()` to merge one user into another. The `user.merged` webhook event is now part of `UserWebhookEvent`, with a payload typed as `UserMergedJSON`.
