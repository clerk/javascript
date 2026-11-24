---
'@clerk/backend': minor
---

Add `EnterpriseConnectionWebhookEvent` to `WebhookEvent`, so `verifyWebhook()` narrows the `enterpriseConnection.created` event Clerk sends when an enterprise connection is created. Its payload, `EnterpriseConnectionWebhookEventJSON`, carries the connection's `id`, `organization_id`, `domains`, `active` and `created_at`; fetch the full enterprise connection from the Backend API by `id` for anything else.

If you handle webhook event types exhaustively, add `enterpriseConnection.created` to your handler map or switch.
