---
'@clerk/backend': minor
---

Add an experimental `clerkClient.emails.create()` method for sending transactional emails. It accepts address- or user-based recipients, supports optional `replyTo`, `subject`, and HTML and/or text content, and returns the created `Email` resource.

This method is marked `@experimental` and may change in a future release.
