---
'@clerk/shared': patch
---

Keep `meta.lockout_expires_in_seconds` on `user_locked` ClerkAPIError objects so apps can show when the lockout ends.
