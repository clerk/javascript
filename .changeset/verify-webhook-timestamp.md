---
'@clerk/backend': minor
---

`verifyWebhook()` now returns the event's top-level `timestamp` (milliseconds since epoch when the event occurred), so webhook handlers can use it to order events.
