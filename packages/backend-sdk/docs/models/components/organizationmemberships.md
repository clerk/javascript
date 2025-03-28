# OrganizationMemberships

A list of organization memberships

## Example Usage

```typescript
import { OrganizationMemberships } from "@clerk/backend-sdk/models/components";

let value: OrganizationMemberships = {
  data: [
    {
      id: "<id>",
      object: "organization_membership",
      role: "<value>",
      permissions: [
        "<value>",
      ],
      publicMetadata: {
        "key": "<value>",
      },
      organization: {
        object: "organization",
        id: "<id>",
        name: "<value>",
        slug: "<value>",
        maxAllowedMemberships: 420539,
        adminDeleteEnabled: false,
        publicMetadata: {
          "key": "<value>",
        },
        privateMetadata: {
          "key": "<value>",
        },
        createdAt: 557369,
        updatedAt: 860552,
      },
      createdAt: 727044,
      updatedAt: 270328,
    },
  ],
  totalCount: 131482,
};
```

## Fields

| Field                                                                                    | Type                                                                                     | Required                                                                                 | Description                                                                              |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `data`                                                                                   | [components.OrganizationMembership](../../models/components/organizationmembership.md)[] | :heavy_check_mark:                                                                       | N/A                                                                                      |
| `totalCount`                                                                             | *number*                                                                                 | :heavy_check_mark:                                                                       | Total number of organization memberships<br/>                                            |