---
"@clerk/ui": patch
---

Use `user.organizationMemberships` from the already-loaded user object to populate the org select in the OAuth consent screen, avoiding a redundant memberships fetch.
