# CreateSignInTokenRequestBody

## Example Usage

```typescript
import { CreateSignInTokenRequestBody } from "@clerk/backend-api-client/models/operations";

let value: CreateSignInTokenRequestBody = {
  userId: "<id>",
};
```

## Fields

| Field                                                                                                                 | Type                                                                                                                  | Required                                                                                                              | Description                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `userId`                                                                                                              | *string*                                                                                                              | :heavy_check_mark:                                                                                                    | The ID of the user that can use the newly created sign in token                                                       |
| `expiresInSeconds`                                                                                                    | *number*                                                                                                              | :heavy_minus_sign:                                                                                                    | Optional parameter to specify the life duration of the sign in token in seconds.<br/>By default, the duration is 30 days. |