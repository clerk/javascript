# OrganizationInvitation

An organization invitation

## Example Usage

```typescript
import { OrganizationInvitation } from '@clerk/backend-sdk/models/components';

let value: OrganizationInvitation = {
  object: 'organization_invitation',
  id: '<id>',
  emailAddress: 'Gladys45@gmail.com',
  role: '<value>',
  roleName: '<value>',
  publicMetadata: {
    key: '<value>',
  },
  url: 'https://serene-guard.org/',
  expiresAt: 690025,
  createdAt: 699622,
  updatedAt: 327720,
};
```

## Fields

| Field             | Type                                                                                               | Required           | Description                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------ |
| `object`          | [components.OrganizationInvitationObject](../../models/components/organizationinvitationobject.md) | :heavy_check_mark: | String representing the object's type. Objects of the same type share the same value.<br/> |
| `id`              | _string_                                                                                           | :heavy_check_mark: | N/A                                                                                        |
| `emailAddress`    | _string_                                                                                           | :heavy_check_mark: | N/A                                                                                        |
| `role`            | _string_                                                                                           | :heavy_check_mark: | N/A                                                                                        |
| `roleName`        | _string_                                                                                           | :heavy_check_mark: | N/A                                                                                        |
| `organizationId`  | _string_                                                                                           | :heavy_minus_sign: | N/A                                                                                        |
| `status`          | _string_                                                                                           | :heavy_minus_sign: | N/A                                                                                        |
| `publicMetadata`  | Record<string, _any_>                                                                              | :heavy_check_mark: | N/A                                                                                        |
| `privateMetadata` | Record<string, _any_>                                                                              | :heavy_minus_sign: | N/A                                                                                        |
| `url`             | _string_                                                                                           | :heavy_check_mark: | N/A                                                                                        |
| `expiresAt`       | _number_                                                                                           | :heavy_check_mark: | Unix timestamp of expiration.                                                              |
| `createdAt`       | _number_                                                                                           | :heavy_check_mark: | Unix timestamp of creation.                                                                |
| `updatedAt`       | _number_                                                                                           | :heavy_check_mark: | Unix timestamp of last update.                                                             |
