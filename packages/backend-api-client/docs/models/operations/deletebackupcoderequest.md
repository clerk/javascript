# DeleteBackupCodeRequest

## Example Usage

```typescript
import { DeleteBackupCodeRequest } from "@clerk/backend-api-client/models/operations";

let value: DeleteBackupCodeRequest = {
  userId: "<id>",
};
```

## Fields

| Field                                                    | Type                                                     | Required                                                 | Description                                              |
| -------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- |
| `userId`                                                 | *string*                                                 | :heavy_check_mark:                                       | The ID of the user whose backup codes are to be deleted. |