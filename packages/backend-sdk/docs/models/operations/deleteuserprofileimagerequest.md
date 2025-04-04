# DeleteUserProfileImageRequest

## Example Usage

```typescript
import { DeleteUserProfileImageRequest } from "@clerk/backend-sdk/models/operations";

let value: DeleteUserProfileImageRequest = {
  userId: "<id>",
};
```

## Fields

| Field                                              | Type                                               | Required                                           | Description                                        |
| -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- |
| `userId`                                           | *string*                                           | :heavy_check_mark:                                 | The ID of the user to delete the profile image for |