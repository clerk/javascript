---
'@clerk/backend': minor
---

Add experimental `emails.createBatch()` for submitting up to 100 transactional emails. Each message supports its own idempotency key and returns an independent success or error result.

Transactional messages now support sender and reply-to display names, cross-domain Reply-To addresses, CC/BCC recipients, attachments, and custom headers. These options require a backend deployment that supports them.
