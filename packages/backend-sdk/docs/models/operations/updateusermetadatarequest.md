# UpdateUserMetadataRequest

## Example Usage

```typescript
import { UpdateUserMetadataRequest } from "@clerk/backend-sdk/models/operations";

let value: UpdateUserMetadataRequest = {
  userId: "<id>",
};
```

## Fields

| Field                                                                                                | Type                                                                                                 | Required                                                                                             | Description                                                                                          |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `userId`                                                                                             | *string*                                                                                             | :heavy_check_mark:                                                                                   | The ID of the user whose metadata will be updated and merged                                         |
| `requestBody`                                                                                        | [operations.UpdateUserMetadataRequestBody](../../models/operations/updateusermetadatarequestbody.md) | :heavy_minus_sign:                                                                                   | N/A                                                                                                  |