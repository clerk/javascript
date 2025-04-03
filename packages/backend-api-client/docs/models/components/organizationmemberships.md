# OrganizationMemberships

A list of organization memberships

## Example Usage

```typescript
import { OrganizationMemberships } from "@clerk/backend-api-client/models/components";

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
        maxAllowedMemberships: 557369,
        adminDeleteEnabled: false,
        publicMetadata: {
          "key": "<value>",
        },
        privateMetadata: {
          "key": "<value>",
        },
        createdAt: 860552,
        updatedAt: 727044,
      },
      createdAt: 270328,
      updatedAt: 131482,
    },
  ],
  totalCount: 55374,
};
```

## Fields

| Field                                                                                    | Type                                                                                     | Required                                                                                 | Description                                                                              |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `data`                                                                                   | [components.OrganizationMembership](../../models/components/organizationmembership.md)[] | :heavy_check_mark:                                                                       | N/A                                                                                      |
| `totalCount`                                                                             | *number*                                                                                 | :heavy_check_mark:                                                                       | Total number of organization memberships<br/>                                            |