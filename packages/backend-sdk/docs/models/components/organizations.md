# Organizations

A list of organizations

## Example Usage

```typescript
import { Organizations } from '@clerk/backend-sdk/models/components';

let value: Organizations = {
  data: [
    {
      object: 'organization',
      id: '<id>',
      name: '<value>',
      slug: '<value>',
      maxAllowedMemberships: 618480,
      adminDeleteEnabled: false,
      publicMetadata: {
        key: '<value>',
      },
      privateMetadata: {
        key: '<value>',
      },
      createdAt: 974257,
      updatedAt: 990345,
    },
  ],
  totalCount: 409054,
};
```

## Fields

| Field        | Type                                                                 | Required           | Description                        |
| ------------ | -------------------------------------------------------------------- | ------------------ | ---------------------------------- |
| `data`       | [components.Organization](../../models/components/organization.md)[] | :heavy_check_mark: | N/A                                |
| `totalCount` | _number_                                                             | :heavy_check_mark: | Total number of organizations<br/> |
