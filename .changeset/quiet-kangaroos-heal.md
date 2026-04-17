---
"@clerk/ui": patch
---

Fix org select in OAuth consent triggering the "Organizations feature required" dev dialog on instances with the Organizations feature disabled. Replaces `useOrganizationList` with `user.organizationMemberships`, which is populated synchronously with the user object and requires no loading state.
