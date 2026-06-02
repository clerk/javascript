---
'@clerk/ui': patch
---

Scope the `UserProfile` active-devices fetch cache by `user.id` so a session switch or sign-out/sign-in on a shared device no longer renders the previous user's device activity (IP, location, browser/device) from the module-scoped cache.
