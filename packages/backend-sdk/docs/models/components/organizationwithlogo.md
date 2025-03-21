# OrganizationWithLogo

## Example Usage

```typescript
import { OrganizationWithLogo } from '@clerk/backend-sdk/models/components';

let value: OrganizationWithLogo = {
  object: 'organization',
  id: '<id>',
  name: '<value>',
  slug: '<value>',
  maxAllowedMemberships: 989410,
  adminDeleteEnabled: false,
  publicMetadata: {
    key: '<value>',
  },
  privateMetadata: {
    key: '<value>',
  },
  createdAt: 65304,
  updatedAt: 783235,
  imageUrl: 'https://excellent-petticoat.biz/',
  hasImage: false,
};
```

## Fields

| Field                                  | Type                                                                                           | Required           | Description                                                                                                             |
| -------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `object`                               | [components.OrganizationWithLogoObject](../../models/components/organizationwithlogoobject.md) | :heavy_check_mark: | N/A                                                                                                                     |
| `id`                                   | _string_                                                                                       | :heavy_check_mark: | N/A                                                                                                                     |
| `name`                                 | _string_                                                                                       | :heavy_check_mark: | N/A                                                                                                                     |
| `slug`                                 | _string_                                                                                       | :heavy_check_mark: | N/A                                                                                                                     |
| `membersCount`                         | _number_                                                                                       | :heavy_minus_sign: | N/A                                                                                                                     |
| `missingMemberWithElevatedPermissions` | _boolean_                                                                                      | :heavy_minus_sign: | N/A                                                                                                                     |
| `pendingInvitationsCount`              | _number_                                                                                       | :heavy_minus_sign: | N/A                                                                                                                     |
| `maxAllowedMemberships`                | _number_                                                                                       | :heavy_check_mark: | N/A                                                                                                                     |
| `adminDeleteEnabled`                   | _boolean_                                                                                      | :heavy_check_mark: | N/A                                                                                                                     |
| `publicMetadata`                       | Record<string, _any_>                                                                          | :heavy_check_mark: | N/A                                                                                                                     |
| `privateMetadata`                      | Record<string, _any_>                                                                          | :heavy_check_mark: | N/A                                                                                                                     |
| `createdBy`                            | _string_                                                                                       | :heavy_minus_sign: | N/A                                                                                                                     |
| `createdAt`                            | _number_                                                                                       | :heavy_check_mark: | Unix timestamp of creation.<br/>                                                                                        |
| `updatedAt`                            | _number_                                                                                       | :heavy_check_mark: | Unix timestamp of last update.<br/>                                                                                     |
| ~~`logoUrl`~~                          | _string_                                                                                       | :heavy_minus_sign: | : warning: ** DEPRECATED **: This will be removed in a future release, please migrate away from it as soon as possible. |
| `imageUrl`                             | _string_                                                                                       | :heavy_check_mark: | N/A                                                                                                                     |
| `hasImage`                             | _boolean_                                                                                      | :heavy_check_mark: | N/A                                                                                                                     |
