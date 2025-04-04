# Organization

## Example Usage

```typescript
import { Organization } from "@clerk/backend-api-client/models/components";

let value: Organization = {
  object: "organization",
  id: "<id>",
  name: "<value>",
  slug: "<value>",
  maxAllowedMemberships: 876527,
  adminDeleteEnabled: false,
  publicMetadata: {
    "key": "<value>",
  },
  privateMetadata: {
    "key": "<value>",
  },
  createdAt: 164019,
  updatedAt: 574019,
};
```

## Fields

| Field                                                                          | Type                                                                           | Required                                                                       | Description                                                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `object`                                                                       | [components.OrganizationObject](../../models/components/organizationobject.md) | :heavy_check_mark:                                                             | N/A                                                                            |
| `id`                                                                           | *string*                                                                       | :heavy_check_mark:                                                             | N/A                                                                            |
| `name`                                                                         | *string*                                                                       | :heavy_check_mark:                                                             | N/A                                                                            |
| `slug`                                                                         | *string*                                                                       | :heavy_check_mark:                                                             | N/A                                                                            |
| `membersCount`                                                                 | *number*                                                                       | :heavy_minus_sign:                                                             | N/A                                                                            |
| `missingMemberWithElevatedPermissions`                                         | *boolean*                                                                      | :heavy_minus_sign:                                                             | N/A                                                                            |
| `pendingInvitationsCount`                                                      | *number*                                                                       | :heavy_minus_sign:                                                             | N/A                                                                            |
| `maxAllowedMemberships`                                                        | *number*                                                                       | :heavy_check_mark:                                                             | N/A                                                                            |
| `adminDeleteEnabled`                                                           | *boolean*                                                                      | :heavy_check_mark:                                                             | N/A                                                                            |
| `publicMetadata`                                                               | Record<string, *any*>                                                          | :heavy_check_mark:                                                             | N/A                                                                            |
| `privateMetadata`                                                              | Record<string, *any*>                                                          | :heavy_check_mark:                                                             | N/A                                                                            |
| `createdBy`                                                                    | *string*                                                                       | :heavy_minus_sign:                                                             | N/A                                                                            |
| `createdAt`                                                                    | *number*                                                                       | :heavy_check_mark:                                                             | Unix timestamp of creation.<br/>                                               |
| `updatedAt`                                                                    | *number*                                                                       | :heavy_check_mark:                                                             | Unix timestamp of last update.<br/>                                            |