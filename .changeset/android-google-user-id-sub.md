---
'@clerk/expo-google-signin': patch
---

Android now reports the Google account's stable identifier (the ID token's `sub` claim) as `user.id` instead of the email address, matching iOS.
