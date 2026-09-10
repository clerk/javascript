---
'@clerk/nextjs': patch
'@clerk/backend': patch
---

App Router client-side navigations that arrive in a recoverable signed-out session state (for example an expired but refreshable session token) are now answered with a `401` instead of a Clerk redirect. The Next.js router falls back to a full document navigation, which can recover the session through a handshake, rather than soft-navigating the user to the sign-in page or leaving the navigation hanging. Users who are genuinely signed out still get the usual redirect, so signing out and navigating to a sign-in page stays instant.
