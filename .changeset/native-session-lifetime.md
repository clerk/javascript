---
"@clerk/clerk-js": minor
"@clerk/shared": minor
---

Fix `expireAt` and `abandonAt` being replaced with the current time for sessions without a maximum lifetime, which the Frontend API sends as `0`. Both now stay at Unix epoch zero, including when a cached client is restored. Add `hasMaximumLifetime` to `SessionResource` and `SessionWithActivitiesResource`; it is `false` when the session has no maximum lifetime.
