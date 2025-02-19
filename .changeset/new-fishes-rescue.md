---
'@clerk/clerk-js': patch
---

Bug fix: Broadcast a sign out event to all opened tabs when `Clerk.signOut()` or `User.delete()` is called.
