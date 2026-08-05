---
'@clerk/backend': minor
---

Add `clerkClient.users.removePassword(userId, params?)` to remove a user's password through the Backend API. Password removal is allowed even when the user has no alternate sign-in method configured. Existing sessions remain active by default; pass `{ signOutOfOtherSessions: true }` to revoke them.
