---
'@clerk/nextjs': patch
---

Updates the default middleware config matcher to be more restrictive in how it detects static files. Paths with `.` in them are now allowed, as long as the `.` is not in the final path segment.
