---
'@clerk/backend': minor
---

Add `external_id` field to `user.deleted` webhook events; Add `user` field to `SessionWebhookEventJSON`

- Adds `external_id` field to `user.deleted` webhook events by creating a new `UserDeletedJSON` interface that extends `DeletedObjectJSON` to include an optional `external_id` string.
- Creates a new `SessionWebhookEventJSON` interface that extends `SessionJSON` to include a nullable `user` field as the `UserJSON` interface, and updates the webhook event types to use this new interface for `session.created`, `session.ended`, `session.removed`, and `session.revoked` events.
