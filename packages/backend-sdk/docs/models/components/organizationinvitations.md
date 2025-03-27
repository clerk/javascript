# OrganizationInvitations

A list of organization invitations

## Example Usage

```typescript
import { OrganizationInvitations } from "@clerk/backend-sdk/models/components";

let value: OrganizationInvitations = {
  data: [
    {
      object: "organization_invitation",
      id: "<id>",
      emailAddress: "Lou_Cronin@hotmail.com",
      role: "<value>",
      roleName: "<value>",
      publicMetadata: {
        "key": "<value>",
      },
      url: "https://tinted-importance.org",
      expiresAt: 575751,
      createdAt: 820767,
      updatedAt: 908844,
    },
  ],
  totalCount: 815524,
};
```

## Fields

| Field                                                                                    | Type                                                                                     | Required                                                                                 | Description                                                                              |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `data`                                                                                   | [components.OrganizationInvitation](../../models/components/organizationinvitation.md)[] | :heavy_check_mark:                                                                       | N/A                                                                                      |
| `totalCount`                                                                             | *number*                                                                                 | :heavy_check_mark:                                                                       | Total number of organization invitations<br/>                                            |