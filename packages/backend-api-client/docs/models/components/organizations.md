# Organizations

A list of organizations

## Example Usage

```typescript
import { Organizations } from "@clerk/backend-api-client/models/components";

let value: Organizations = {
  data: [
    {
      object: "organization",
      id: "<id>",
      name: "<value>",
      slug: "<value>",
      maxAllowedMemberships: 992012,
      adminDeleteEnabled: false,
      publicMetadata: {
        "key": "<value>",
      },
      privateMetadata: {
        "key": "<value>",
      },
      createdAt: 249420,
      updatedAt: 105906,
    },
  ],
  totalCount: 950953,
};
```

## Fields

| Field                                                                | Type                                                                 | Required                                                             | Description                                                          |
| -------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `data`                                                               | [components.Organization](../../models/components/organization.md)[] | :heavy_check_mark:                                                   | N/A                                                                  |
| `totalCount`                                                         | *number*                                                             | :heavy_check_mark:                                                   | Total number of organizations<br/>                                   |