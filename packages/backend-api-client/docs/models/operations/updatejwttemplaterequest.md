# UpdateJWTTemplateRequest

## Example Usage

```typescript
import { UpdateJWTTemplateRequest } from "@clerk/backend-api-client/models/operations";

let value: UpdateJWTTemplateRequest = {
  templateId: "<id>",
};
```

## Fields

| Field                                                                                              | Type                                                                                               | Required                                                                                           | Description                                                                                        |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `templateId`                                                                                       | *string*                                                                                           | :heavy_check_mark:                                                                                 | The ID of the JWT template to update                                                               |
| `requestBody`                                                                                      | [operations.UpdateJWTTemplateRequestBody](../../models/operations/updatejwttemplaterequestbody.md) | :heavy_minus_sign:                                                                                 | N/A                                                                                                |