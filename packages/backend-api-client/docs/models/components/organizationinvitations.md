# OrganizationInvitations

A list of organization invitations

## Example Usage

```typescript
import { OrganizationInvitations } from "@clerk/backend-api-client/models/components";

let value: OrganizationInvitations = {
  data: [
    {
      object: "organization_invitation",
      id: "<id>",
      emailAddress: "Jacinto_Feest3@hotmail.com",
      role: "<value>",
      roleName: "<value>",
      publicMetadata: {
        "key": "<value>",
      },
      url: "https://black-director.biz/",
      expiresAt: 253191,
      createdAt: 131055,
      updatedAt: 12036,
    },
  ],
  totalCount: 115484,
};
```

## Fields

| Field                                                                                    | Type                                                                                     | Required                                                                                 | Description                                                                              |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `data`                                                                                   | [components.OrganizationInvitation](../../models/components/organizationinvitation.md)[] | :heavy_check_mark:                                                                       | N/A                                                                                      |
| `totalCount`                                                                             | *number*                                                                                 | :heavy_check_mark:                                                                       | Total number of organization invitations<br/>                                            |