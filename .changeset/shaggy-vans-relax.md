---
'@clerk/clerk-js': patch
'@clerk/types': patch
---

Introduces a new internal class `UserOrganizationInvitation` that represents and invitation to join an organization with the organization data populated
Additions to support the above
- UserOrganizationInvitationResource
- UserOrganizationInvitationJSON
- ClerkPaginatedResponse
  
ClerkPaginatedResponse represents a paginated FAPI response
