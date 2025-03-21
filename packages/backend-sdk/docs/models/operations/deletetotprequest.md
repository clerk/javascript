# DeleteTOTPRequest

## Example Usage

```typescript
import { DeleteTOTPRequest } from '@clerk/backend-sdk/models/operations';

let value: DeleteTOTPRequest = {
  userId: '<id>',
};
```

## Fields

| Field    | Type     | Required           | Description                                      |
| -------- | -------- | ------------------ | ------------------------------------------------ |
| `userId` | _string_ | :heavy_check_mark: | The ID of the user whose TOTPs are to be deleted |
