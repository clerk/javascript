# OrganizationDomains

A list of organization domains

## Example Usage

```typescript
import { OrganizationDomains } from "@clerk/backend-api-client/models/components";

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
        status: "unverified",
        strategy: "<value>",
        attempts: 70869,
        expireAt: 292794,
      },
      totalPendingInvitations: 152354,
      totalPendingSuggestions: 417486,
      createdAt: 131289,
      updatedAt: 604118,
    },
  ],
  totalCount: 382808,
};
```

## Fields

| Field                                                                            | Type                                                                             | Required                                                                         | Description                                                                      |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `data`                                                                           | [components.OrganizationDomain](../../models/components/organizationdomain.md)[] | :heavy_check_mark:                                                               | N/A                                                                              |
| `totalCount`                                                                     | *number*                                                                         | :heavy_check_mark:                                                               | Total number of organization domains<br/>                                        |