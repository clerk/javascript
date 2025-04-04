# UpdateEmailAddressRequest

## Example Usage

```typescript
import { UpdateEmailAddressRequest } from "@clerk/backend-api-client/models/operations";

let value: UpdateEmailAddressRequest = {
  emailAddressId: "<id>",
};
```

## Fields

| Field                                                                                                | Type                                                                                                 | Required                                                                                             | Description                                                                                          |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `emailAddressId`                                                                                     | *string*                                                                                             | :heavy_check_mark:                                                                                   | The ID of the email address to update                                                                |
| `requestBody`                                                                                        | [operations.UpdateEmailAddressRequestBody](../../models/operations/updateemailaddressrequestbody.md) | :heavy_minus_sign:                                                                                   | N/A                                                                                                  |