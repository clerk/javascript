# LockUserRequest

## Example Usage

```typescript
import { LockUserRequest } from "@clerk/backend-api-client/models/operations";

let value: LockUserRequest = {
  userId: "<id>",
};
```

## Fields

| Field                      | Type                       | Required                   | Description                |
| -------------------------- | -------------------------- | -------------------------- | -------------------------- |
| `userId`                   | *string*                   | :heavy_check_mark:         | The ID of the user to lock |