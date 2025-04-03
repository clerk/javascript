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
      emailAddress: "Alvena_Blick@yahoo.com",
      role: "<value>",
      roleName: "<value>",
      publicMetadata: {
        "key": "<value>",
      },
      url: "https://punctual-amnesty.info",
      expiresAt: 510017,
      createdAt: 536178,
      updatedAt: 681393,
    },
  ],
  totalCount: 277596,
};
```

## Fields

| Field                                                                                                                                        | Type                                                                                                                                         | Required                                                                                                                                     | Description                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`                                                                                                                                       | [components.OrganizationInvitationWithPublicOrganizationData](../../models/components/organizationinvitationwithpublicorganizationdata.md)[] | :heavy_check_mark:                                                                                                                           | N/A                                                                                                                                          |
| `totalCount`                                                                                                                                 | *number*                                                                                                                                     | :heavy_check_mark:                                                                                                                           | Total number of organization invitations<br/>                                                                                                |