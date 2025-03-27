# Organizations

A list of organizations

## Example Usage

```typescript
import { Organizations } from "@clerk/backend-sdk/models/components";

let value: Organizations = {
  data: [
    {
      object: "organization",
      id: "<id>",
      name: "<value>",
      slug: "<value>",
      maxAllowedMemberships: 904949,
      adminDeleteEnabled: false,
      publicMetadata: {
        "key": "<value>",
      },
      privateMetadata: {
        "key": "<value>",
      },
      createdAt: 296556,
      updatedAt: 992012,
    },
  ],
  totalCount: 249420,
};
```

## Fields

| Field                                                                | Type                                                                 | Required                                                             | Description                                                          |
| -------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `data`                                                               | [components.Organization](../../models/components/organization.md)[] | :heavy_check_mark:                                                   | N/A                                                                  |
| `totalCount`                                                         | *number*                                                             | :heavy_check_mark:                                                   | Total number of organizations<br/>                                   |