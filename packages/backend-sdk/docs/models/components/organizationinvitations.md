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
      emailAddress: "Tyrese.Kling@gmail.com",
      role: "<value>",
      roleName: "<value>",
      publicMetadata: {
        "key": "<value>",
      },
      url: "https://aggravating-horde.com/",
      expiresAt: 251941,
      createdAt: 221161,
      updatedAt: 253191,
    },
  ],
  totalCount: 131055,
};
```

## Fields

| Field                                                                                    | Type                                                                                     | Required                                                                                 | Description                                                                              |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `data`                                                                                   | [components.OrganizationInvitation](../../models/components/organizationinvitation.md)[] | :heavy_check_mark:                                                                       | N/A                                                                                      |
| `totalCount`                                                                             | *number*                                                                                 | :heavy_check_mark:                                                                       | Total number of organization invitations<br/>                                            |