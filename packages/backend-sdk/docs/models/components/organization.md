# Organization

## Example Usage

```typescript
import { Organization } from '@clerk/backend-sdk/models/components';

let value: Organization = {
  object: 'organization',
  id: '<id>',
  name: '<value>',
  slug: '<value>',
  maxAllowedMemberships: 162954,
  adminDeleteEnabled: false,
  publicMetadata: {
    key: '<value>',
  },
  privateMetadata: {
    key: '<value>',
  },
  createdAt: 638762,
  updatedAt: 490305,
};
```

## Fields

| Field                                  | Type                                                                           | Required           | Description                         |
| -------------------------------------- | ------------------------------------------------------------------------------ | ------------------ | ----------------------------------- |
| `object`                               | [components.OrganizationObject](../../models/components/organizationobject.md) | :heavy_check_mark: | N/A                                 |
| `id`                                   | _string_                                                                       | :heavy_check_mark: | N/A                                 |
| `name`                                 | _string_                                                                       | :heavy_check_mark: | N/A                                 |
| `slug`                                 | _string_                                                                       | :heavy_check_mark: | N/A                                 |
| `membersCount`                         | _number_                                                                       | :heavy_minus_sign: | N/A                                 |
| `missingMemberWithElevatedPermissions` | _boolean_                                                                      | :heavy_minus_sign: | N/A                                 |
| `pendingInvitationsCount`              | _number_                                                                       | :heavy_minus_sign: | N/A                                 |
| `maxAllowedMemberships`                | _number_                                                                       | :heavy_check_mark: | N/A                                 |
| `adminDeleteEnabled`                   | _boolean_                                                                      | :heavy_check_mark: | N/A                                 |
| `publicMetadata`                       | Record<string, _any_>                                                          | :heavy_check_mark: | N/A                                 |
| `privateMetadata`                      | Record<string, _any_>                                                          | :heavy_check_mark: | N/A                                 |
| `createdBy`                            | _string_                                                                       | :heavy_minus_sign: | N/A                                 |
| `createdAt`                            | _number_                                                                       | :heavy_check_mark: | Unix timestamp of creation.<br/>    |
| `updatedAt`                            | _number_                                                                       | :heavy_check_mark: | Unix timestamp of last update.<br/> |
