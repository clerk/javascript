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
        status: "verified",
        strategy: "<value>",
        attempts: 151251,
        expireAt: 281645,
      },
      totalPendingInvitations: 311206,
      totalPendingSuggestions: 882518,
      createdAt: 642879,
      updatedAt: 237153,
    },
  ],
  totalCount: 402888,
};
```

## Fields

| Field                                                                            | Type                                                                             | Required                                                                         | Description                                                                      |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `data`                                                                           | [components.OrganizationDomain](../../models/components/organizationdomain.md)[] | :heavy_check_mark:                                                               | N/A                                                                              |
| `totalCount`                                                                     | *number*                                                                         | :heavy_check_mark:                                                               | Total number of organization domains<br/>                                        |