# VerifyTOTPRequest

## Example Usage

```typescript
import { VerifyTOTPRequest } from "@clerk/backend-sdk/models/operations";

let value: VerifyTOTPRequest = {
  userId: "<id>",
};
```

## Fields

| Field                                                                                | Type                                                                                 | Required                                                                             | Description                                                                          |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `userId`                                                                             | *string*                                                                             | :heavy_check_mark:                                                                   | The ID of the user for whom to verify the TOTP                                       |
| `requestBody`                                                                        | [operations.VerifyTOTPRequestBody](../../models/operations/verifytotprequestbody.md) | :heavy_minus_sign:                                                                   | N/A                                                                                  |