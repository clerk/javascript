# OrganizationMemberships

A list of organization memberships

## Example Usage

```typescript
import { OrganizationMemberships } from '@clerk/backend-sdk/models/components';

let value: OrganizationMemberships = {
  data: [
    {
      id: '<id>',
      object: 'organization_membership',
      role: '<value>',
      permissions: ['<value>'],
      publicMetadata: {
        key: '<value>',
      },
      organization: {
        object: 'organization',
        id: '<id>',
        name: '<value>',
        slug: '<value>',
        maxAllowedMemberships: 347233,
        adminDeleteEnabled: false,
        publicMetadata: {
          key: '<value>',
        },
        privateMetadata: {
          key: '<value>',
        },
        createdAt: 148141,
        updatedAt: 981830,
      },
      createdAt: 478370,
      updatedAt: 497391,
    },
  ],
  totalCount: 639473,
};
```

## Fields

| Field        | Type                                                                                     | Required           | Description                                   |
| ------------ | ---------------------------------------------------------------------------------------- | ------------------ | --------------------------------------------- |
| `data`       | [components.OrganizationMembership](../../models/components/organizationmembership.md)[] | :heavy_check_mark: | N/A                                           |
| `totalCount` | _number_                                                                                 | :heavy_check_mark: | Total number of organization memberships<br/> |
