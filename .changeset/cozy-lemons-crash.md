---
'@clerk/nextjs': patch
---

Fix an App Router navigation edge case where duplicate in-flight redirects to the same destination could leave Clerk's awaitable navigation pending indefinitely.
