---
'@clerk/clerk-js': patch
'@clerk/shared': patch
---

Narrow the error conditions that trigger the unauthenticated flow (sign-out) to only high-confidence authentication failures (401, 422). Previously, all 4xx errors — including 429 rate limits — were treated as auth failures, which could sign users out during transient rate limiting. Non-auth errors from `setActive` now propagate to the caller instead of being silently swallowed.
