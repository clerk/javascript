# UnlockUserRequest

## Example Usage

```typescript
import { UnlockUserRequest } from "@clerk/backend-api-client/models/operations";

let value: UnlockUserRequest = {
  userId: "<id>",
};
```

## Fields

| Field                        | Type                         | Required                     | Description                  |
| ---------------------------- | ---------------------------- | ---------------------------- | ---------------------------- |
| `userId`                     | *string*                     | :heavy_check_mark:           | The ID of the user to unlock |