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
      emailAddress: "Cody.Bergstrom@yahoo.com",
      role: "<value>",
      roleName: "<value>",
      publicMetadata: {
        "key": "<value>",
      },
      url: "https://grandiose-epic.biz",
      expiresAt: 244152,
      createdAt: 319917,
      updatedAt: 133999,
    },
  ],
  totalCount: 510654,
};
```

## Fields

| Field                                                                                    | Type                                                                                     | Required                                                                                 | Description                                                                              |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `data`                                                                                   | [components.OrganizationInvitation](../../models/components/organizationinvitation.md)[] | :heavy_check_mark:                                                                       | N/A                                                                                      |
| `totalCount`                                                                             | *number*                                                                                 | :heavy_check_mark:                                                                       | Total number of organization invitations<br/>                                            |