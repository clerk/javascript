---
'@clerk/localizations': patch
'@clerk/clerk-js': patch
'@clerk/types': patch
---

A OrganizationMembershipRequest can now be rejected

- New `OrganizationMembershipRequest.reject` method alongside `accept`
- As an organization admin, navigate to `Organization Profile` > `Members` > `Requests`. You can now reject a request from the table.
