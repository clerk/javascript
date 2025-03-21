# DeleteBackupCodeRequest

## Example Usage

```typescript
import { DeleteBackupCodeRequest } from '@clerk/backend-sdk/models/operations';

let value: DeleteBackupCodeRequest = {
  userId: '<id>',
};
```

## Fields

| Field    | Type     | Required           | Description                                              |
| -------- | -------- | ------------------ | -------------------------------------------------------- |
| `userId` | _string_ | :heavy_check_mark: | The ID of the user whose backup codes are to be deleted. |
