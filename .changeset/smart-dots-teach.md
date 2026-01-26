---
'@clerk/ui': patch
---

Fix incorrect guard for hiding "Create organization" action. The `maxAllowedMemberships` setting limits seats per organization, not the number of organizations a user can create.
