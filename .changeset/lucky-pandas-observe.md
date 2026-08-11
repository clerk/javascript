---
'@clerk/clerk-js': minor
'@clerk/shared': minor
---

Improve Clerk Protect's ability to distinguish real users from automated sign-in and sign-up attempts, on instances that have Protect enabled.

This is inert unless your instance opts in, it can never block or delay a sign-in or sign-up, and an instance that does not use it stores nothing in the browser and sends nothing extra.
