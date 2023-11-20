---
'@clerk/backend': minor
---

Deprecate `createSMSMessage` and `SMSMessageApi` from `clerkClient`.

The `/sms_messages` Backend API endpoint will also be dropped in the future since this feature will no longer be available for new Clerk instances.

For a brief period it will still be accessible for instances that have used it in the past 7
days (13-11-2023 to 20-11-2023).

New instances will get a 403 forbidden response if they try to access it.
