# OrganizationInvitationsWithPublicOrganizationData

A list of organization invitations with public organization data

## Example Usage

```typescript
import { OrganizationInvitationsWithPublicOrganizationData } from "@clerk/backend-sdk/models/components";

let value: OrganizationInvitationsWithPublicOrganizationData = {
  data: [
    {
      object: "organization_invitation",
      id: "<id>",
      emailAddress: "Jaida.Schmidt51@gmail.com",
      role: "<value>",
      roleName: "<value>",
      publicMetadata: {
        "key": "<value>",
      },
      url: "https://whimsical-parsnip.com",
      expiresAt: 430402,
      createdAt: 510017,
      updatedAt: 536178,
    },
  ],
  totalCount: 681393,
};
```

## Fields

| Field                                                                                                                                        | Type                                                                                                                                         | Required                                                                                                                                     | Description                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`                                                                                                                                       | [components.OrganizationInvitationWithPublicOrganizationData](../../models/components/organizationinvitationwithpublicorganizationdata.md)[] | :heavy_check_mark:                                                                                                                           | N/A                                                                                                                                          |
| `totalCount`                                                                                                                                 | *number*                                                                                                                                     | :heavy_check_mark:                                                                                                                           | Total number of organization invitations<br/>                                                                                                |