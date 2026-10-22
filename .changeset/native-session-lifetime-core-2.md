---
'@clerk/clerk-js': patch
---

Keep a session's `expireAt` and `abandonAt` at Unix epoch zero when the session has no maximum lifetime, instead of falling back to the current time.
