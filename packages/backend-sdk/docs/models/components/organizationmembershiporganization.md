# OrganizationMembershipOrganization

## Example Usage

```typescript
import { OrganizationMembershipOrganization } from '@clerk/backend-sdk/models/components';

let value: OrganizationMembershipOrganization = {
  object: 'organization',
  id: '<id>',
  name: '<value>',
  slug: '<value>',
  maxAllowedMemberships: 368584,
  adminDeleteEnabled: false,
  publicMetadata: {
    key: '<value>',
  },
  privateMetadata: {
    key: '<value>',
  },
  createdAt: 136900,
  updatedAt: 822118,
};
```

## Fields

| Field                                  | Type                                                                                                                       | Required           | Description                         |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------ | ----------------------------------- |
| `object`                               | [components.OrganizationMembershipOrganizationObject](../../models/components/organizationmembershiporganizationobject.md) | :heavy_check_mark: | N/A                                 |
| `id`                                   | _string_                                                                                                                   | :heavy_check_mark: | N/A                                 |
| `name`                                 | _string_                                                                                                                   | :heavy_check_mark: | N/A                                 |
| `slug`                                 | _string_                                                                                                                   | :heavy_check_mark: | N/A                                 |
| `membersCount`                         | _number_                                                                                                                   | :heavy_minus_sign: | N/A                                 |
| `missingMemberWithElevatedPermissions` | _boolean_                                                                                                                  | :heavy_minus_sign: | N/A                                 |
| `pendingInvitationsCount`              | _number_                                                                                                                   | :heavy_minus_sign: | N/A                                 |
| `maxAllowedMemberships`                | _number_                                                                                                                   | :heavy_check_mark: | N/A                                 |
| `adminDeleteEnabled`                   | _boolean_                                                                                                                  | :heavy_check_mark: | N/A                                 |
| `publicMetadata`                       | Record<string, _any_>                                                                                                      | :heavy_check_mark: | N/A                                 |
| `privateMetadata`                      | Record<string, _any_>                                                                                                      | :heavy_check_mark: | N/A                                 |
| `createdBy`                            | _string_                                                                                                                   | :heavy_minus_sign: | N/A                                 |
| `createdAt`                            | _number_                                                                                                                   | :heavy_check_mark: | Unix timestamp of creation.<br/>    |
| `updatedAt`                            | _number_                                                                                                                   | :heavy_check_mark: | Unix timestamp of last update.<br/> |
