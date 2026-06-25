---
'@clerk/backend': minor
---

Add an experimental `clerkClient.emails.create()` method for sending a transactional email through the Clerk Backend API. Accepts `to`, `from`, optional `replyTo`, `subject`, and `html`/`text` content and returns the created `Email` resource. The `to` recipient is mutually exclusive: pass either `{ address }` (with an optional `name`) or `{ userId }`, in which case Clerk resolves that user's primary email address server-side. The underlying endpoint is internal and not yet generally available, so the method is marked `@experimental` and is subject to change; pin your SDK version if you rely on it.
