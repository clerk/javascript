---
'@clerk/backend': minor
---

Add `clerkClient.users.removePassword(userId, params?)` to remove a user's password through the Backend API. Existing sessions remain active by default; pass `{ signOutOfOtherSessions: true }` to revoke them.
