---
'@clerk/clerk-js': patch
---

Keep a session's `expireAt` and `abandonAt` at Unix epoch zero when the session has no maximum lifetime, instead of replacing them with the current time. Sessions restored from a client snapshot keep these deadlines too.
