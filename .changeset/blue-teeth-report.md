---
'@clerk/backend': minor
---

Add `user_id` field to `organizationInvitation.accepted` webhook events.

Creates a new `OrganizationInvitationAcceptedJSON` interface that extends `OrganizationInvitationJSON` with a required `user_id` field, and updates the webhook type system to use this interface specifically for `organizationInvitation`.accepted events.
