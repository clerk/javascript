# OrganizationInvitationsWithPublicOrganizationData

A list of organization invitations with public organization data

## Example Usage

```typescript
import { OrganizationInvitationsWithPublicOrganizationData } from '@clerk/backend-sdk/models/components';

let value: OrganizationInvitationsWithPublicOrganizationData = {
  data: [
    {
      object: 'organization_invitation',
      id: '<id>',
      emailAddress: 'Caesar_Borer@hotmail.com',
      role: '<value>',
      roleName: '<value>',
      publicMetadata: {
        key: '<value>',
      },
      url: 'https://torn-railway.biz',
      expiresAt: 131482,
      createdAt: 55374,
      updatedAt: 301598,
    },
  ],
  totalCount: 262118,
};
```

## Fields

| Field        | Type                                                                                                                                         | Required           | Description                                   |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | --------------------------------------------- |
| `data`       | [components.OrganizationInvitationWithPublicOrganizationData](../../models/components/organizationinvitationwithpublicorganizationdata.md)[] | :heavy_check_mark: | N/A                                           |
| `totalCount` | _number_                                                                                                                                     | :heavy_check_mark: | Total number of organization invitations<br/> |
