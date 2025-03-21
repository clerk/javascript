# OrganizationMembershipPublicUserData

An organization membership with public user data populated

## Example Usage

```typescript
import { OrganizationMembershipPublicUserData } from '@clerk/backend-sdk/models/components';

let value: OrganizationMembershipPublicUserData = {
  userId: '<id>',
  firstName: 'Watson',
  lastName: 'Ullrich-Ryan',
  profileImageUrl: 'https://bossy-hamburger.biz/',
  imageUrl: 'https://awesome-quinoa.com/',
  hasImage: false,
};
```

## Fields

| Field                 | Type      | Required           | Description                                                                                                             |
| --------------------- | --------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `userId`              | _string_  | :heavy_check_mark: | N/A                                                                                                                     |
| `firstName`           | _string_  | :heavy_check_mark: | N/A                                                                                                                     |
| `lastName`            | _string_  | :heavy_check_mark: | N/A                                                                                                                     |
| ~~`profileImageUrl`~~ | _string_  | :heavy_check_mark: | : warning: ** DEPRECATED **: This will be removed in a future release, please migrate away from it as soon as possible. |
| `imageUrl`            | _string_  | :heavy_check_mark: | N/A                                                                                                                     |
| `hasImage`            | _boolean_ | :heavy_check_mark: | N/A                                                                                                                     |
| `identifier`          | _string_  | :heavy_minus_sign: | N/A                                                                                                                     |
