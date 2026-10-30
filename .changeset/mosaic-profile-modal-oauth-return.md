---
'@clerk/mosaic': patch
---

The user profile modal now reopens on the Account page after a user leaves it to connect or reconnect a social or enterprise account, or to verify an email address through enterprise SSO. Mosaic no longer sends `__clerk_modal_state` on these redirects, so returning from them no longer opens the legacy profile modal.
