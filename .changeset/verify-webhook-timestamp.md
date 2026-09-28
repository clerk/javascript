---
'@clerk/backend': minor
---

`verifyWebhook()` now returns the event's top-level `timestamp` (milliseconds since epoch when the event occurred) and `instance_id`, so webhook handlers can order events and identify the instance that sent them.
