---
'@clerk/clerk-js': patch
---

Fix sign-ins and sign-ups being blocked by Device Intelligence checks when the same origin served more than one Clerk instance, such as an app moving from development to production keys. The Device Intelligence token is now stored per instance, so a token acquired for one instance is no longer sent to another.
