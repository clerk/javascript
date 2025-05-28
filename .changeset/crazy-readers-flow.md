---
'@clerk/clerk-js': patch
---

Fix an issue where clerk-js was incorrectly emitting the new session's token during session switching. This impacts some applications that rely on Clerk's multi-session behavior.
