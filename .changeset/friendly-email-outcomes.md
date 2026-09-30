---
'@clerk/backend': minor
---

Add webhook types for transactional email delivery, delays, bounces, complaints, failures, and suppressions. Bounce events distinguish `Permanent`, `Transient`, and `Undetermined` classifications. `verifyWebhook()` preserves the original event timestamp and instance ID for outcome handlers. These types prepare for the transactional email pilot; receiving the events requires the corresponding backend rollout.
