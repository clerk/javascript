---
'@clerk/clerk-js': patch
---

Use `Clerk.setActive` after deleting a user to reuse the same logic as signing out.
