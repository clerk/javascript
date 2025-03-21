# OrganizationInvitationWithPublicOrganizationData

An organization invitation with public organization data populated

## Example Usage

```typescript
import { OrganizationInvitationWithPublicOrganizationData } from '@clerk/backend-sdk/models/components';

let value: OrganizationInvitationWithPublicOrganizationData = {
  object: 'organization_invitation',
  id: '<id>',
  emailAddress: 'Marjory18@yahoo.com',
  role: '<value>',
  roleName: '<value>',
  publicMetadata: {
    key: '<value>',
  },
  url: 'https://rubbery-sauerkraut.net/',
  expiresAt: 259422,
  createdAt: 373813,
  updatedAt: 587600,
};
```

## Fields

| Field                    | Type                                                                                                                                                   | Required           | Description                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ | ------------------------------------------------------------------------------------------ |
| `object`                 | [components.OrganizationInvitationWithPublicOrganizationDataObject](../../models/components/organizationinvitationwithpublicorganizationdataobject.md) | :heavy_check_mark: | String representing the object's type. Objects of the same type share the same value.<br/> |
| `id`                     | _string_                                                                                                                                               | :heavy_check_mark: | N/A                                                                                        |
| `emailAddress`           | _string_                                                                                                                                               | :heavy_check_mark: | N/A                                                                                        |
| `role`                   | _string_                                                                                                                                               | :heavy_check_mark: | N/A                                                                                        |
| `roleName`               | _string_                                                                                                                                               | :heavy_check_mark: | N/A                                                                                        |
| `organizationId`         | _string_                                                                                                                                               | :heavy_minus_sign: | N/A                                                                                        |
| `status`                 | _string_                                                                                                                                               | :heavy_minus_sign: | N/A                                                                                        |
| `publicMetadata`         | Record<string, _any_>                                                                                                                                  | :heavy_check_mark: | N/A                                                                                        |
| `privateMetadata`        | Record<string, _any_>                                                                                                                                  | :heavy_minus_sign: | N/A                                                                                        |
| `url`                    | _string_                                                                                                                                               | :heavy_check_mark: | N/A                                                                                        |
| `expiresAt`              | _number_                                                                                                                                               | :heavy_check_mark: | Unix timestamp of expiration.                                                              |
| `createdAt`              | _number_                                                                                                                                               | :heavy_check_mark: | Unix timestamp of creation.                                                                |
| `updatedAt`              | _number_                                                                                                                                               | :heavy_check_mark: | Unix timestamp of last update.                                                             |
| `publicOrganizationData` | [components.OrganizationInvitationPublicOrganizationData](../../models/components/organizationinvitationpublicorganizationdata.md)                     | :heavy_minus_sign: | N/A                                                                                        |
