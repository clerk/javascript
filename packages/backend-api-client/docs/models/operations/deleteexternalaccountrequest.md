# DeleteExternalAccountRequest

## Example Usage

```typescript
import { DeleteExternalAccountRequest } from "@clerk/backend-api-client/models/operations";

let value: DeleteExternalAccountRequest = {
  userId: "<id>",
  externalAccountId: "<id>",
};
```

## Fields

| Field                                    | Type                                     | Required                                 | Description                              |
| ---------------------------------------- | ---------------------------------------- | ---------------------------------------- | ---------------------------------------- |
| `userId`                                 | *string*                                 | :heavy_check_mark:                       | The ID of the user's external account    |
| `externalAccountId`                      | *string*                                 | :heavy_check_mark:                       | The ID of the external account to delete |