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
        maxAllowedMemberships: 674775,
        adminDeleteEnabled: false,
        publicMetadata: {
          "key": "<value>",
        },
        privateMetadata: {
          "key": "<value>",
        },
        createdAt: 501373,
        updatedAt: 323084,
      },
      createdAt: 328328,
      updatedAt: 55823,
    },
  ],
  totalCount: 871679,
};
```

## Fields

| Field                                                                                    | Type                                                                                     | Required                                                                                 | Description                                                                              |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `data`                                                                                   | [components.OrganizationMembership](../../models/components/organizationmembership.md)[] | :heavy_check_mark:                                                                       | N/A                                                                                      |
| `totalCount`                                                                             | *number*                                                                                 | :heavy_check_mark:                                                                       | Total number of organization memberships<br/>                                            |