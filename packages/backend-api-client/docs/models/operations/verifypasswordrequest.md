# VerifyPasswordRequest

## Example Usage

```typescript
import { VerifyPasswordRequest } from "@clerk/backend-api-client/models/operations";

let value: VerifyPasswordRequest = {
  userId: "<id>",
};
```

## Fields

| Field                                                                                        | Type                                                                                         | Required                                                                                     | Description                                                                                  |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `userId`                                                                                     | *string*                                                                                     | :heavy_check_mark:                                                                           | The ID of the user for whom to verify the password                                           |
| `requestBody`                                                                                | [operations.VerifyPasswordRequestBody](../../models/operations/verifypasswordrequestbody.md) | :heavy_minus_sign:                                                                           | N/A                                                                                          |