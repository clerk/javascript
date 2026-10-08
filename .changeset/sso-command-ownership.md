---
'@clerk/ui': patch
---

Prevent retained SSO commands from running after the account, session, client, or organization changes. Keep late requests from changing the current connection selection or opening a test URL for an earlier owner.

Reset test results and paging when the account or connection changes.
