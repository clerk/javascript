---
'@clerk/clerk-js': minor
---

Remove fallback data and allow promise to throw for paginated endpoint methods.
Affected methods:
- Organization.getDomains
- Organization.getInvitations
- Organization.getMembershipRequests
- Organization.getMemberships
- User.getOrganizationInvitations
- User.getOrganizationSuggestions
- User.getOrganizationMemberships
