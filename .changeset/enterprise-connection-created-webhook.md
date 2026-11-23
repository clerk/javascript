---
'@clerk/backend': minor
---

Add `EnterpriseConnectionWebhookEvent` to `WebhookEvent`, so `verifyWebhook()` narrows the `enterpriseConnection.created` event Clerk sends when an enterprise connection is created. Its payload is typed as `EnterpriseConnectionJSON`, the same object the Backend API returns for an enterprise connection.
