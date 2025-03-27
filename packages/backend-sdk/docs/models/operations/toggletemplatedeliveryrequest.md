# ToggleTemplateDeliveryRequest

## Example Usage

```typescript
import { ToggleTemplateDeliveryRequest } from "@clerk/backend-sdk/models/operations";

let value: ToggleTemplateDeliveryRequest = {
  templateType: "email",
  slug: "<value>",
};
```

## Fields

| Field                                                                                                                            | Type                                                                                                                             | Required                                                                                                                         | Description                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `templateType`                                                                                                                   | [operations.ToggleTemplateDeliveryPathParamTemplateType](../../models/operations/toggletemplatedeliverypathparamtemplatetype.md) | :heavy_check_mark:                                                                                                               | The type of template to toggle delivery for                                                                                      |
| `slug`                                                                                                                           | *string*                                                                                                                         | :heavy_check_mark:                                                                                                               | The slug of the template for which to toggle delivery                                                                            |
| `requestBody`                                                                                                                    | [operations.ToggleTemplateDeliveryRequestBody](../../models/operations/toggletemplatedeliveryrequestbody.md)                     | :heavy_minus_sign:                                                                                                               | N/A                                                                                                                              |