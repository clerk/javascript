---
'@clerk/clerk-js': patch
'@clerk/shared': patch
---

Fix sign-ups failing with "There is no account to transfer" when `handleRedirectCallback()` was called again while an earlier call was still running, for example because `<SignIn />` remounted during the OAuth callback. Calls made while one is running now share its result instead of starting a second transfer.
