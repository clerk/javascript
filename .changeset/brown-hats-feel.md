---
'@clerk/clerk-js': patch
---

Improve error handling for invalid avatar file uploads. Previously, avatar images which exceeded the max file size limit of 10MB did not return an error within the Avatar upload component so the user was unaware why their upload did not work.
