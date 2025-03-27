# OrganizationMembership

Hello world

## Example Usage

```typescript
import { OrganizationMembership } from "@clerk/backend-sdk/models/components";

let value: OrganizationMembership = {
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
    maxAllowedMemberships: 189848,
    adminDeleteEnabled: false,
    publicMetadata: {
      "key": "<value>",
    },
    privateMetadata: {
      "key": "<value>",
    },
    createdAt: 511319,
    updatedAt: 224317,
  },
  createdAt: 97844,
  updatedAt: 862192,
};
```

## Fields

| Field                                                                                                              | Type                                                                                                               | Required                                                                                                           | Description                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `id`                                                                                                               | *string*                                                                                                           | :heavy_check_mark:                                                                                                 | N/A                                                                                                                |
| `object`                                                                                                           | [components.OrganizationMembershipObject](../../models/components/organizationmembershipobject.md)                 | :heavy_check_mark:                                                                                                 | String representing the object's type. Objects of the same type share the same value.<br/>                         |
| `role`                                                                                                             | *string*                                                                                                           | :heavy_check_mark:                                                                                                 | N/A                                                                                                                |
| `roleName`                                                                                                         | *string*                                                                                                           | :heavy_minus_sign:                                                                                                 | N/A                                                                                                                |
| `permissions`                                                                                                      | *string*[]                                                                                                         | :heavy_check_mark:                                                                                                 | N/A                                                                                                                |
| `publicMetadata`                                                                                                   | Record<string, *any*>                                                                                              | :heavy_check_mark:                                                                                                 | Metadata saved on the organization membership, accessible from both Frontend and Backend APIs                      |
| `privateMetadata`                                                                                                  | Record<string, *any*>                                                                                              | :heavy_minus_sign:                                                                                                 | Metadata saved on the organization membership, accessible only from the Backend API                                |
| `organization`                                                                                                     | [components.OrganizationMembershipOrganization](../../models/components/organizationmembershiporganization.md)     | :heavy_check_mark:                                                                                                 | N/A                                                                                                                |
| `publicUserData`                                                                                                   | [components.OrganizationMembershipPublicUserData](../../models/components/organizationmembershippublicuserdata.md) | :heavy_minus_sign:                                                                                                 | An organization membership with public user data populated                                                         |
| `createdAt`                                                                                                        | *number*                                                                                                           | :heavy_check_mark:                                                                                                 | Unix timestamp of creation.                                                                                        |
| `updatedAt`                                                                                                        | *number*                                                                                                           | :heavy_check_mark:                                                                                                 | Unix timestamp of last update.                                                                                     |