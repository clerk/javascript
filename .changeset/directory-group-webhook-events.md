---
'@clerk/backend': minor
---

Add `DirectoryGroupWebhookEvent` and `DirectoryGroupMembershipWebhookEvent` to `WebhookEvent`, so `verifyWebhook()` narrows the `directoryGroup.created`, `directoryGroup.updated`, `directoryGroup.deleted`, `directoryGroupMembership.created` and `directoryGroupMembership.deleted` events that Directory Sync sends. Their payload types are exported as `DirectoryGroupWebhookEventJSON`, `DirectoryGroupMembershipWebhookEventJSON` and `DeletedDirectoryGroupMembershipWebhookEventJSON`.
