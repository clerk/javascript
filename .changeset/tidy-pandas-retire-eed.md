---
'@clerk/backend': major
---

Remove the retired `enhancedEmailDeliverability` instance setting. The
underlying delivery path (Clerk's legacy shared-domain sending) has been
retired server-side, and the field is ignored by the Backend API, so it is
removed from `InstanceApi.updateInstance` params, the `InstanceSettings`
resource, and its JSON type.
