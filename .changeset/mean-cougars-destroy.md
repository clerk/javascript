---
'@clerk/clerk-js': patch
---

Fixes issue where email field is required but is not shown after user tries to edit email, when already tried another email before when trying to sign up with a method that not provides and email (e.g Metamask)
