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
        attempts: 994401,
        expireAt: 451822,
      },
      totalPendingInvitations: 70869,
      totalPendingSuggestions: 292794,
      createdAt: 152354,
      updatedAt: 417486,
    },
  ],
  totalCount: 131289,
};
```

## Fields

| Field                                                                            | Type                                                                             | Required                                                                         | Description                                                                      |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `data`                                                                           | [components.OrganizationDomain](../../models/components/organizationdomain.md)[] | :heavy_check_mark:                                                               | N/A                                                                              |
| `totalCount`                                                                     | *number*                                                                         | :heavy_check_mark:                                                               | Total number of organization domains<br/>                                        |