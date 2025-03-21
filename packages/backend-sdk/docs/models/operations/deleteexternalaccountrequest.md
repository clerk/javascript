# DeleteExternalAccountRequest

## Example Usage

```typescript
import { DeleteExternalAccountRequest } from '@clerk/backend-sdk/models/operations';

let value: DeleteExternalAccountRequest = {
  userId: '<id>',
  externalAccountId: '<id>',
};
```

## Fields

| Field               | Type     | Required           | Description                              |
| ------------------- | -------- | ------------------ | ---------------------------------------- |
| `userId`            | _string_ | :heavy_check_mark: | The ID of the user's external account    |
| `externalAccountId` | _string_ | :heavy_check_mark: | The ID of the external account to delete |
