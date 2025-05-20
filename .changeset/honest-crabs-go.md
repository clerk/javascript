---
'@clerk/backend': patch
---

Introduces `createOrganizationInvitationBulk` - it creates new organization invitations in bulk and sends out emails to the provided email addresses with a link to accept the invitation and join the organization.

```ts
const organizationId = 'org_123'
const params = [
  {
    inviterUserId: 'user_1',
    emailAddress: 'testclerk1@clerk.dev',
    role: 'org:admin'
  },
    {
    inviterUserId: 'user_2',
    emailAddress: 'testclerk2@clerk.dev',
    role: 'org:member'
  }
]

const response = await clerkClient.organizations.createOrganizationInvitationBulk(organizationId, params)
```
