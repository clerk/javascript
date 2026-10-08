---
'@clerk/ui': patch
---

Prevent pending organization invitations from updating a different account or session. Clear accepted invitation state when the account or session changes, and prevent duplicate organization join requests. Keep automatic pagination working for organization memberships, invitations, and suggestions.
