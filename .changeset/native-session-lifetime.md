---
'@clerk/clerk-js': minor
'@clerk/shared': minor
---

Add `hasMaximumLifetime` to `SessionResource` and `SessionWithActivitiesResource`. It is `false` for sessions without a maximum lifetime, whose `expireAt` and `abandonAt` now stay at Unix epoch zero instead of being replaced with the current time.
