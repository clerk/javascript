# DisableMFARequest

## Example Usage

```typescript
import { DisableMFARequest } from '@clerk/backend-sdk/models/operations';

let value: DisableMFARequest = {
  userId: '<id>',
};
```

## Fields

| Field    | Type     | Required           | Description                                             |
| -------- | -------- | ------------------ | ------------------------------------------------------- |
| `userId` | _string_ | :heavy_check_mark: | The ID of the user whose MFA methods are to be disabled |
