# DeleteTOTPRequest

## Example Usage

```typescript
import { DeleteTOTPRequest } from "@clerk/backend-api-client/models/operations";

let value: DeleteTOTPRequest = {
  userId: "<id>",
};
```

## Fields

| Field                                            | Type                                             | Required                                         | Description                                      |
| ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------ |
| `userId`                                         | *string*                                         | :heavy_check_mark:                               | The ID of the user whose TOTPs are to be deleted |