---
'@clerk/expo': patch
---

Fix the deprecated `useOAuth()` hook crashing when the sign-in attempt has no external verification redirect URL. It now throws a Clerk error, matching `useSSO()`.
