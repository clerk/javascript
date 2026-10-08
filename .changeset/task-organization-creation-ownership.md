---
'@clerk/ui': patch
---

Prevent duplicate organization creation submissions during a session task. Ignore late results from closed forms or changed accounts, and cancel default-logo downloads when the form closes. Preserve redirects during the SDK session transition. Retry failed activation with the same organization.
