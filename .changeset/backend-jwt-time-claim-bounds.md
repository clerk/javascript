---
'@clerk/backend': patch
---

Fix JWT time claim checks so out-of-range values no longer pass verification. Session tokens and machine JWTs (OAuth access tokens and M2M tokens) with an `exp` before the range a JavaScript `Date` can represent, such as `-1e300`, are now rejected as expired, and an `nbf` or `iat` beyond that range is now rejected as not yet valid. Time claims that are not finite numbers are rejected as invalid.
