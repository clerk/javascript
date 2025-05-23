# OrganizationInvitationsWithPublicOrganizationData

A list of organization invitations with public organization data

## Example Usage

```typescript
import { OrganizationInvitationsWithPublicOrganizationData } from "@clerk/backend-api-client/models/components";

let value: OrganizationInvitationsWithPublicOrganizationData = {
  data: [
    {
      object: "organization_invitation",
      id: "<id>",
      emailAddress: "Cruz_Brakus@yahoo.com",
      role: "<value>",
      roleName: "<value>",
      publicMetadata: {
        "key": "<value>",
      },
      url: "https://dark-underneath.org/",
      expiresAt: 82541,
      createdAt: 32271,
      updatedAt: 430026,
    },
  ],
  totalCount: 536855,
};
```

## Fields

| Field                                                                                                                                        | Type                                                                                                                                         | Required                                                                                                                                     | Description                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`                                                                                                                                       | [components.OrganizationInvitationWithPublicOrganizationData](../../models/components/organizationinvitationwithpublicorganizationdata.md)[] | :heavy_check_mark:                                                                                                                           | N/A                                                                                                                                          |
| `totalCount`                                                                                                                                 | *number*                                                                                                                                     | :heavy_check_mark:                                                                                                                           | Total number of organization invitations<br/>                                                                                                |