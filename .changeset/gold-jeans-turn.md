---
'@clerk/clerk-js': patch
'@clerk/shared': patch
'@clerk/types': patch
---

Updates signature of OrganizationMembership.retrieve to support backwards compatibility while allowing using the new paginated responses.

+ userMemberships is now also part of the returned values of useOrganizationList
