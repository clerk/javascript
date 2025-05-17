# UpdatePhoneNumberRequest

## Example Usage

```typescript
import { UpdatePhoneNumberRequest } from "@clerk/backend-api-client/models/operations";

let value: UpdatePhoneNumberRequest = {
  phoneNumberId: "<id>",
};
```

## Fields

| Field                                                                                              | Type                                                                                               | Required                                                                                           | Description                                                                                        |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `phoneNumberId`                                                                                    | *string*                                                                                           | :heavy_check_mark:                                                                                 | The ID of the phone number to update                                                               |
| `requestBody`                                                                                      | [operations.UpdatePhoneNumberRequestBody](../../models/operations/updatephonenumberrequestbody.md) | :heavy_minus_sign:                                                                                 | N/A                                                                                                |