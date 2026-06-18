---
'@clerk/backend': minor
---

Add an experimental `clerkClient.emails.create()` method for sending a transactional email through the Clerk Backend API. Accepts `to`, `from`, optional `replyTo`, `subject`, and `html`/`text` content and returns the created `Email` resource. The underlying endpoint is internal and not yet generally available, so the method is marked `@experimental` and is subject to change; pin your SDK version if you rely on it.
