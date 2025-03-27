# OrganizationDomains

A list of organization domains

## Example Usage

```typescript
import { OrganizationDomains } from "@clerk/backend-sdk/models/components";

let value: OrganizationDomains = {
  data: [
    {
      object: "organization_domain",
      id: "<id>",
      organizationId: "<id>",
      name: "<value>",
      enrollmentMode: "automatic_suggestion",
      affiliationEmailAddress: "<value>",
      verification: {
        status: "verified",
        strategy: "<value>",
        attempts: 968972,
        expireAt: 904949,
      },
      totalPendingInvitations: 296556,
      totalPendingSuggestions: 992012,
      createdAt: 249420,
      updatedAt: 105906,
    },
  ],
  totalCount: 950953,
};
```

## Fields

| Field                                                                            | Type                                                                             | Required                                                                         | Description                                                                      |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `data`                                                                           | [components.OrganizationDomain](../../models/components/organizationdomain.md)[] | :heavy_check_mark:                                                               | N/A                                                                              |
| `totalCount`                                                                     | *number*                                                                         | :heavy_check_mark:                                                               | Total number of organization domains<br/>                                        |