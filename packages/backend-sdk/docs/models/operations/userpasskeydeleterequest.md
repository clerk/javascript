# UserPasskeyDeleteRequest

## Example Usage

```typescript
import { UserPasskeyDeleteRequest } from '@clerk/backend-sdk/models/operations';

let value: UserPasskeyDeleteRequest = {
  userId: '<id>',
  passkeyIdentificationId: '<id>',
};
```

## Fields

| Field                     | Type     | Required           | Description                                       |
| ------------------------- | -------- | ------------------ | ------------------------------------------------- |
| `userId`                  | _string_ | :heavy_check_mark: | The ID of the user that owns the passkey identity |
| `passkeyIdentificationId` | _string_ | :heavy_check_mark: | The ID of the passkey identity to be deleted      |
