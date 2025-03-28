# OrganizationMembershipPublicUserData

An organization membership with public user data populated

## Example Usage

```typescript
import { OrganizationMembershipPublicUserData } from "@clerk/backend-sdk/models/components";

let value: OrganizationMembershipPublicUserData = {
  userId: "<id>",
  firstName: "Chet",
  lastName: "Bednar",
  profileImageUrl: "https://spanish-sarong.biz",
  imageUrl: "https://outstanding-dress.info/",
  hasImage: false,
};
```

## Fields

| Field                                                                                                                   | Type                                                                                                                    | Required                                                                                                                | Description                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `userId`                                                                                                                | *string*                                                                                                                | :heavy_check_mark:                                                                                                      | N/A                                                                                                                     |
| `firstName`                                                                                                             | *string*                                                                                                                | :heavy_check_mark:                                                                                                      | N/A                                                                                                                     |
| `lastName`                                                                                                              | *string*                                                                                                                | :heavy_check_mark:                                                                                                      | N/A                                                                                                                     |
| ~~`profileImageUrl`~~                                                                                                   | *string*                                                                                                                | :heavy_check_mark:                                                                                                      | : warning: ** DEPRECATED **: This will be removed in a future release, please migrate away from it as soon as possible. |
| `imageUrl`                                                                                                              | *string*                                                                                                                | :heavy_check_mark:                                                                                                      | N/A                                                                                                                     |
| `hasImage`                                                                                                              | *boolean*                                                                                                               | :heavy_check_mark:                                                                                                      | N/A                                                                                                                     |
| `identifier`                                                                                                            | *string*                                                                                                                | :heavy_minus_sign:                                                                                                      | N/A                                                                                                                     |